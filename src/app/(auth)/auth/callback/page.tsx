'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/SupabaseProvider';

export default function AuthCallback() {
  const router = useRouter();
  const { session, loading, refreshSession } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await refreshSession();
        
        // If we have a session after refresh, redirect to dashboard
        if (session) {
          router.push('/dashboard');
        } else {
          // If no session, something went wrong
          router.push('/auth?error=SessionNotEstablished');
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        router.push('/auth?error=AuthCallbackError');
      }
    };

    if (!loading) {
      handleCallback();
    }
  }, [loading, router, refreshSession, session]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Authentication</h1>
        <p className="mb-8">Please wait while we complete the authentication process...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}
