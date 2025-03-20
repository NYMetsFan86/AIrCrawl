"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const exchangeCodeForSession = async () => {
      let code = searchParams?.get('code');

      if (!code) {
        // Fallback to manually parsing the URL if searchParams is unavailable or empty
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get('code');
      }

      if (!code) {
        console.error('No code found in URL');
        router.replace('/auth?error=NoCode');
        return;
      }

      console.log('OAuth Code Received:', code);

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Error exchanging code for session:', error);
          router.replace(`/auth?error=${encodeURIComponent(error.message)}`);
        } else {
          router.replace('/dashboard'); // ✅ Successful login redirects to dashboard
        }
      } catch (err) {
        console.error('Unexpected error during authentication:', err);
        router.replace('/auth?error=UnexpectedError');
      }
    };

    exchangeCodeForSession();
  }, [router, searchParams, supabase]);

  return <p>Processing authentication...</p>; // Show a loading state
}