import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/auth',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  '/api/auth',
  '/not-found',
  '/404.html',
  '/coming-soon'
];

// Define auth paths (redirect authenticated users away from these)
const authPaths = [
  '/auth',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith('/api/') || pathname.includes('.')
  );

  // Initialize supabase client with request/response
  const supabase = createMiddlewareClient({ req, res });
  
  // Get the session
  const { data: { session } } = await supabase.auth.getSession();

  // If user is signed in and trying to access auth pages, redirect to dashboard
  if (session && authPaths.some(path => pathname === path)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If user is not signed in and trying to access protected pages, redirect to auth
  if (!session && !isPublicPath) {
    // Save the original URL they were trying to access
    const redirectUrl = new URL('/auth', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // For all other cases, continue
  return res;
}

// Apply middleware to all routes except static files and api routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};