import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl

  // Skip middleware for:
  // - API routes
  // - Static files
  // - Next.js internals
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Skip for localhost development and main domain
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const isMainDomain = hostname === process.env.NEXT_PUBLIC_MAIN_DOMAIN

  if (isLocalhost || isMainDomain) {
    return NextResponse.next()
  }

  // Check if this hostname is a custom domain for a project
  try {
    const project = await db.project.findByDomain(hostname)

    if (project && project.status === 'ACTIVE') {
      // Rewrite to the project page
      const rewriteUrl = new URL(`/p/${project.slug}${url.pathname}${url.search}`, request.url)
      return NextResponse.rewrite(rewriteUrl)
    }
  } catch (error) {
    console.error('Middleware error:', error)
    // Continue to normal routing if database error
  }

  // If no custom domain found, continue with normal routing
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
