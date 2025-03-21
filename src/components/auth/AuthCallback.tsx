'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const exchangeCodeForSession = async () => {
      const code = searchParams?.get('code');
      if (!code) {
        console.error('No code found in URL');
        router.replace('/auth?error=NoCode'); // Show an error page
        return;
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Failed to exchange code for session:', error);
          router.replace(`/auth?error=${encodeURIComponent(error.message)}`);
        } else {
          router.replace('/dashboard'); // ✅ Successful login redirects to dashboard
        }
      } catch (err: any) {
        console.error('Unexpected error during session exchange:', err);
        router.replace('/auth?error=UnexpectedError');
      }
    };

    exchangeCodeForSession();
  }, [router, searchParams, supabase]);

  return <p>Processing authentication...</p>; // Show a loading state
}
