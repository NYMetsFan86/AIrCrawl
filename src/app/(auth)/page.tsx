"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const error = searchParams?.get('error');
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is already authenticated, redirect to the callback URL
      if (session) {
        router.push(callbackUrl);
      }
    };
    
    checkSession();
  }, [router, callbackUrl, supabase]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <h2 className="mb-6 text-center text-2xl font-bold">Sign in to your account</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error === 'Authentication_failed' ? 'Authentication failed. Please try again.' : error}
            </div>
          )}
          <AuthForm type="login" />
          <div className="mt-4 text-center text-sm">
            <p>Don't have an account? <a href="/auth/register" className="text-blue-600 hover:underline">Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}