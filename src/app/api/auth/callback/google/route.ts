// src/app/api/auth/callback/google/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const state = requestUrl.searchParams.get('state');

  if (error || !code) {
    console.error("Google auth error or cancellation:", error);

    const redirectUrl = state?.includes('from=register') 
      ? '/register?error=UserCanceled' 
      : '/auth?error=UserCanceled';

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  try {
    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      if (sessionError) {
        console.error("Error exchanging code for session:", sessionError);
        return NextResponse.redirect(new URL('/auth?error=SessionExchangeFailed', request.url));
      }
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err) {
    console.error("Unexpected error during authentication:", err);
    return NextResponse.redirect(new URL('/auth?error=UnexpectedError', request.url));
  }
}