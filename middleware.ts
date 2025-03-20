import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
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
];

// Define auth paths (redirect authenticated users away from these)
const authPaths = [
  '/auth',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
];

export async function middleware(req: NextRequest) {
  // Initialize response
  const res = NextResponse.next();

  // Initialize supabase client with request/response
  const supabase = createMiddlewareClient({ req, res });

  // Automatically redirect authenticated users to dashboard
  const { data: { session } } = await supabase.auth.getSession();
  if (session && authPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Return the modified response
  return res;
}

// Apply to all routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export function createClient(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
  );

  return { supabase, response };
}