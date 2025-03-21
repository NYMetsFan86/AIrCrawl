"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const error = searchParams?.get('error');
  const message = searchParams?.get('message');
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
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

  useEffect(() => {
    const exchangeCodeForSession = async () => {
      if (!searchParams) return;
      
      const code = searchParams.get('code');
      if (!code) return; // Early return if no code, avoiding the console error

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Failed to exchange code for session:', error);
        router.replace(`/auth?error=${encodeURIComponent(error.message)}`);
      } else {
        router.replace(callbackUrl); // Redirect to callback URL
      }
    };

    // Only execute if there's a code parameter
    if (searchParams?.get('code')) {
      exchangeCodeForSession();
    }
  }, [router, searchParams, supabase, callbackUrl]);

  interface ResetPasswordFormEvent extends React.FormEvent<HTMLFormElement> {
    preventDefault: () => void;
  }

  const handleResetPassword = async (e: ResetPasswordFormEvent): Promise<void> => {
    e.preventDefault();
    if (!email) return;

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setResetSent(true);
    } catch (err: unknown) {
      console.error('Reset password error:', err);
    } finally {
      setResetLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="AIrCrawl Logo" 
              width={140} 
              height={40} 
              className="h-10 w-auto" 
            />
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {authMode === 'login' && (
            <div className="bg-white py-8 px-10 shadow-lg rounded-lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Access your AIrCrawl dashboard and tools
                </p>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {error === 'Authentication_failed' ? 'Authentication failed. Please try again.' : error}
                </div>
              )}
              
              {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                  {message}
                </div>
              )}
              
              <AuthForm type="login" />
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setAuthMode('reset')} 
                  className="text-[#860808] hover:text-[#5a0505] text-sm font-medium"
                >
                  Forgot your password?
                </button>
              </div>
              
              <div className="mt-6 text-center text-sm border-t border-gray-200 pt-6">
                <p>Don't have an account? <Link href="/auth/register" className="text-[#860808] font-medium hover:text-[#5a0505]">Sign up</Link></p>
              </div>
            </div>
          )}
          
          {authMode === 'reset' && (
            <div className="bg-white py-8 px-10 shadow-lg rounded-lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
                <p className="mt-2 text-sm text-gray-600">
                  We'll send you an email with password reset instructions
                </p>
              </div>
              
              {resetSent ? (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-center">
                  <p className="font-medium mb-2">Reset link sent!</p>
                  <p className="text-sm">Please check your email for instructions on how to reset your password.</p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#860808] focus:border-[#860808]"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#860808] hover:bg-[#5a0505] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#860808] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setAuthMode('login')} 
                  className="text-[#860808] hover:text-[#5a0505] text-sm font-medium"
                >
                  Back to sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} AIrCrawl. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-[#860808]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#860808]">Terms of Service</Link>
            <Link href="/contact" className="hover:text-[#860808]">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}