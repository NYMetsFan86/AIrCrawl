"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const exchangeCodeForSession = async () => {
      const code = searchParams.get('code');
      if (!code) {
        console.error('No code found in URL');
        router.replace('/auth?error=NoCode');
        return;
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Failed to exchange code for session:', error);
          router.replace(`/auth?error=${encodeURIComponent(error.message)}`);
        } else {
          router.replace('/dashboard');
        }
      } catch (err: any) {
        console.error('Unexpected error during session exchange:', err);
        router.replace('/auth?error=UnexpectedError');
      }
    };

    exchangeCodeForSession();
  }, [router, searchParams]);

  return <p>Processing authentication...</p>;
}