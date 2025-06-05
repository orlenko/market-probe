import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sendFormSubmissionNotification, isValidEmail } from '@/lib/email';
import {
  getClientIP,
  hashIP,
  sanitizeUserAgent,
  sanitizeReferrer,
  extractUTMParams,
  checkRateLimit,
} from '@/lib/privacy';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Form validation schema
const formSubmissionSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    company: z.string().max(100, 'Company name too long').optional(),
    message: z.string().max(1000, 'Message too long').optional(),
    phone: z.string().max(20, 'Phone number too long').optional(),
  })
  .catchall(z.string().max(200)); // Allow additional custom fields

const requestSchema = z.object({
  formData: formSubmissionSchema,
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  honeypot: z.string().optional(), // Anti-spam honeypot field
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get client IP for rate limiting and tracking
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Rate limiting - 5 submissions per minute per IP
    const rateLimit = checkRateLimit(ipHash, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Anti-spam: Check honeypot field
    if (validatedData.honeypot) {
      console.log('Spam detected: honeypot field filled', { ipHash });
      return NextResponse.json({ success: true }); // Return success to not alert bots
    }

    // Find project by slug
    const project = await db.project.findBySlug(slug);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Additional email validation
    if (!isValidEmail(validatedData.formData.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Extract request metadata
    const userAgent = sanitizeUserAgent(request.headers.get('user-agent') || undefined);
    const referrer = sanitizeReferrer(request.headers.get('referer') || undefined);

    // Extract UTM parameters from request or referrer
    const utmFromRequest = {
      utmSource: validatedData.utmSource,
      utmMedium: validatedData.utmMedium,
      utmCampaign: validatedData.utmCampaign,
    };

    const utmFromReferrer = referrer ? extractUTMParams(referrer) : {};

    // Prefer UTM from request body, fallback to referrer
    const finalUTM = {
      utmSource: utmFromRequest.utmSource || utmFromReferrer.utmSource,
      utmMedium: utmFromRequest.utmMedium || utmFromReferrer.utmMedium,
      utmCampaign: utmFromRequest.utmCampaign || utmFromReferrer.utmCampaign,
    };

    // Store form submission in database
    const submission = await db.forms.submit({
      projectId: project.id,
      formData: validatedData.formData,
      ipHash,
      userAgent,
      referrer,
      ...finalUTM,
    });

    // Track analytics event for form submission
    await db.analytics.trackEvent({
      projectId: project.id,
      eventType: 'FORM_SUBMISSION',
      ipHash,
      userAgent,
      referrer,
      pathname: `/p/${slug}`,
      ...finalUTM,
      metadata: {
        submissionId: submission.id,
        formFields: Object.keys(validatedData.formData),
      },
    });

    // Send email notification (async, don't wait for it)
    const submissionDetails = {
      submittedAt: submission.submittedAt,
      referrer,
      ...finalUTM,
    };

    sendFormSubmissionNotification(project.title, validatedData.formData, submissionDetails).catch(
      error => {
        console.error('Failed to send email notification:', error);
        // Don't fail the request if email fails
      }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Thank you for joining the waitlist! We'll be in touch soon.",
      submissionId: submission.id,
    });
  } catch (error) {
    console.error('Form submission error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.reduce(
        (acc, err) => {
          const field = err.path.join('.');
          acc[field] = err.message;
          return acc;
        },
        {} as Record<string, string>
      );

      return NextResponse.json(
        {
          error: 'Validation failed',
          fields: fieldErrors,
        },
        { status: 400 }
      );
    }

    // Handle database errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'This email has already been submitted for this project.' },
          { status: 409 }
        );
      }
    }

    // Generic server error
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
