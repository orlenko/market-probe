import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  getClientIP,
  hashIP,
  sanitizeUserAgent,
  sanitizeReferrer,
  extractUTMParams,
  checkRateLimit,
  detectDeviceType,
  extractBrowser
} from '@/lib/privacy'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Analytics event validation schema
const analyticsEventSchema = z.object({
  slug: z.string().min(1, 'Project slug is required'),
  eventType: z.enum([
    'PAGE_VIEW',
    'FORM_SUBMISSION',
    'BUTTON_CLICK',
    'LINK_CLICK',
    'SCROLL_DEPTH',
    'SESSION_START'
  ]),
  referrer: z.string().url().optional(),
  pathname: z.string().optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  metadata: z.object({
    button_text: z.string().max(100).optional(),
    link_url: z.string().url().max(500).optional(),
    scroll_percentage: z.number().min(0).max(100).optional(),
    session_duration: z.number().min(0).optional(),
    custom: z.record(z.string().max(200)).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting and tracking
    const clientIP = getClientIP(request)
    const ipHash = hashIP(clientIP)

    // Rate limiting - 100 analytics events per minute per IP
    const rateLimit = checkRateLimit(`analytics:${ipHash}`, 100, 60000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          }
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = analyticsEventSchema.parse(body)

    // Find project by slug
    const project = await db.project.findBySlug(validatedData.slug)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Extract request metadata
    const userAgent = sanitizeUserAgent(request.headers.get('user-agent') || undefined)
    const referrerHeader = sanitizeReferrer(request.headers.get('referer') || undefined)

    // Use referrer from request body if provided, otherwise from header
    const finalReferrer = validatedData.referrer || referrerHeader

    // Extract UTM parameters from referrer if not provided
    const utmFromReferrer = finalReferrer ? extractUTMParams(finalReferrer) : {}
    const finalUTM = {
      utmSource: validatedData.utmSource || utmFromReferrer.utmSource,
      utmMedium: validatedData.utmMedium || utmFromReferrer.utmMedium,
      utmCampaign: validatedData.utmCampaign || utmFromReferrer.utmCampaign,
    }

    // Enhance metadata with device and browser information
    const enhancedMetadata = {
      ...validatedData.metadata,
      device_type: detectDeviceType(userAgent),
      browser: extractBrowser(userAgent),
    }

    // Store analytics event in database
    await db.analytics.trackEvent({
      projectId: project.id,
      eventType: validatedData.eventType,
      ipHash,
      userAgent,
      referrer: finalReferrer,
      pathname: validatedData.pathname || `/p/${validatedData.slug}`,
      ...finalUTM,
      metadata: enhancedMetadata,
    })

    // Return success response
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics tracking error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid analytics event data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    // Generic server error (don't expose details)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// GET endpoint for retrieving analytics data (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const days = parseInt(searchParams.get('days') || '30')

    if (!slug) {
      return NextResponse.json(
        { error: 'Project slug is required' },
        { status: 400 }
      )
    }

    // Find project by slug
    const project = await db.project.findBySlug(slug)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get project statistics
    const stats = await db.analytics.getProjectStats(project.id, days)

    return NextResponse.json({
      project: {
        id: project.id,
        slug: project.slug,
        title: project.title,
      },
      period: {
        days,
        from: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
      ...stats,
    })

  } catch (error) {
    console.error('Analytics retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    )
  }
}
