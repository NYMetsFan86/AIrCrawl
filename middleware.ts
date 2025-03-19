import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr'

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
];

// Define auth paths (redirect authenticated users away from these)
const authPaths = [
  '/auth',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Create Supabase client for authentication
  const { supabase, response } = createClient(request);
  
  // Get the user session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  const isAuthPath = authPaths.some(authPath => 
    path === authPath || path.startsWith(`${authPath}/`)
  );
  
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`) || path.startsWith('/api/')
  );

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If user is not authenticated and trying to access protected routes, redirect to auth
  if (!session && !isPublicPath) {
    // Store the original URL to redirect back after login
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth/callback).*)',
  ],
};

export function createClient(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  return { supabase, response }
}