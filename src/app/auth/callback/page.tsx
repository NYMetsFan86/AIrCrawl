"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleSession = async () => {
      try {
        // The code exchange happens automatically in the background
        // We just need to handle the session status
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          router.replace('/auth?error=' + encodeURIComponent(error.message));
          return;
        }
        
        if (session) {
          // Redirect to dashboard on successful login
          router.replace('/dashboard');
        } else {
          // No session found, redirect to login
          router.replace('/auth?error=No_session_found');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        router.replace('/auth?error=Unknown_error');
      }
    };

    handleSession();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#860808] mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}