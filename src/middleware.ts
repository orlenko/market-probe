import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hasValidClerkKey } from '@/lib/clerk-utils';

const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Only protect admin routes if Clerk is properly configured with a real key
  if (isProtectedRoute(req) && hasValidClerkKey()) {
    await auth.protect();
  }

  // Custom domain routing logic
  const hostname = req.headers.get('host') || '';
  const url = req.nextUrl;

  // Skip middleware for:
  // - Non-admin API routes
  // - Static files
  // - Next.js internals
  if (
    (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/admin/')) ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Skip for localhost development and main domain
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const isMainDomain = hostname === process.env.NEXT_PUBLIC_MAIN_DOMAIN;

  if (isLocalhost || isMainDomain) {
    return NextResponse.next();
  }

  // Check if this hostname is a custom domain for a project
  try {
    const project = await db.project.findByDomain(hostname);

    if (project && project.status === 'ACTIVE') {
      // Rewrite to the project page
      const rewriteUrl = new URL(`/p/${project.slug}${url.pathname}${url.search}`, req.url);
      return NextResponse.rewrite(rewriteUrl);
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // Continue to normal routing if database error
  }

  // If no custom domain found, continue with normal routing
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - EXCEPT /api/admin/* which need authentication
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/(?!admin).*|_next/static|_next/image|favicon.ico).*)',
    '/api/admin/(.*)',
  ],
};
