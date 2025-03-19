// Path: /src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Processing authentication...');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const code = searchParams?.get('code');
    const error = searchParams?.get('error');
    
    if (error) {
      setMessage(`Authentication error: ${error}`);
      setTimeout(() => router.push('/auth?error=Authentication_failed'), 2000);
      return;
    }
    
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }
          
          // Successfully authenticated
          router.push('/dashboard');
        })
        .catch(error => {
          console.error('Error exchanging code for session:', error);
          router.push('/auth?error=Authentication_failed');
        });
    } else {
      // Check for hash fragment from OAuth providers
      const handleHashFragment = async () => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            router.push('/dashboard');
          } catch (error) {
            console.error('Error setting session:', error);
            router.push('/auth?error=Authentication_failed');
          }
        } else {
          setMessage('No authentication data found');
          setTimeout(() => router.push('/auth?error=Missing_auth_data'), 2000);
        }
      };

      handleHashFragment();
    }
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Authentication</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}