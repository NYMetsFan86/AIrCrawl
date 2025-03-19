"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/components/providers/SupabaseProvider";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function AuthForm({ type = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
        if (!result.success) throw new Error('Login failed');
        router.push('/dashboard');
      } else {
        // Fixed: Use correct Supabase user_metadata structure
                const result = await signUp({ 
                  email, 
                  password,
                  name: email, // Using email as the default name
                  metadata: { name: email }
                });
        if (!result.success) throw new Error('Signup failed');
        router.push('/auth?message=Check your email to confirm your account');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback/google`
        }
      });
      if (error) throw new Error(error.message);
      // No finally block needed here as component will unmount on successful redirect
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Image src="/logo.png" alt="Logo" width={180} height={60} />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <div>
          <label className="block mb-1">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={formLoading || googleLoading} className="w-full">
          {formLoading ? 'Processing...' : type === 'login' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>
      <div className="text-center">
        <Button onClick={handleGoogleSignIn} disabled={formLoading || googleLoading} className="w-full">
          {googleLoading ? 'Processing...' : 'Sign in with Google'}
        </Button>
      </div>
    </div>
  );
}
