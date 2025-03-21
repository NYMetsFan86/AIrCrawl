"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/components/providers/SupabaseProvider";
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AuthFormProps {
  type: 'login' | 'register';
}

export function AuthForm({ type = 'login' }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (type === 'login') {
        const result = await signIn({ email, password });
        if (!result.success) throw new Error(result.error?.message || 'Login failed');
        router.push('/dashboard');
      } else {
        // Fixed: Use correct Supabase user_metadata structure
        const result = await signUp({ 
          email, 
          password,
          name: email, // Using email as the default name
          metadata: { name: email }
        });
        if (!result.success) throw new Error(result.error?.message || 'Signup failed');
        router.push('/auth?message=Check your email to confirm your account');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      console.log("Using redirect URI:", redirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUri },
      });

      if (error) {
        console.error("Google Sign-in error:", error);
        throw error;
      } else {
        console.log("Redirecting to:", data?.url);
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        }
      });
      
      console.log('Redirecting to GitHub OAuth...');
      console.log('Redirect URL:', data?.url || 'No URL received');
      
      if (error) {
        console.error('GitHub Sign-in error:', error);
        throw error;
      } else {
        window.location.href = data.url;  // Force redirect to GitHub's login
      }
    } catch (err: any) {
      setError(err.message || 'GitHub sign-in failed');
      setGithubLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={type === 'login' ? 'current-password' : 'new-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#860808] focus:border-[#860808]"
            placeholder={type === 'login' ? 'Enter your password' : 'Create a password'}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={formLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#860808] hover:bg-[#5a0505] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#860808] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formLoading 
              ? 'Processing...' 
              : type === 'login' 
                ? 'Sign In' 
                : 'Create Account'
            }
          </button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={signInWithGoogle}
          disabled={googleLoading || formLoading}
          className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#860808] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            'Processing...'
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="#4285F4"
                />
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="#4285F4"
                />
              </svg>
              Google
            </>
          )}
        </button>

        <button
          onClick={handleGithubSignIn}
          disabled={githubLoading || formLoading}
          className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#860808] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {githubLoading ? (
            'Processing...'
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                />
              </svg>
              GitHub
            </>
          )}
        </button>
      </div>
    </div>
  );
}