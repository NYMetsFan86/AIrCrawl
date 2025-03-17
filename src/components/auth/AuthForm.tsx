"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/components/providers/SupabaseProvider";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

export function AuthForm({ type = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (type === 'login') {
        const result = await signIn({ email, password });
        if (!result.success) throw new Error(result.error?.message || 'Login failed');
        router.push('/dashboard');
      } else {
        const result = await signUp({ 
          email, 
          password, 
          name: email.split('@')[0], 
          metadata: { name: email.split('@')[0] } 
        });
        if (!result.success) throw new Error(result.error?.message || 'Signup failed');
        router.push('/auth?message=Check your email to confirm your account');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
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
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Processing...' : type === 'login' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>
    </div>
  );
}
