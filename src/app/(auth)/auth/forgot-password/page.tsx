"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { useToast } from '@/components/ui/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { sendPasswordResetEmail } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await sendPasswordResetEmail(email);
      if (result) {
        setSuccess(true);
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your inbox for a password reset link",
        });
      } else {
        throw new Error("Failed to send password reset email");
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Check Your Email</h2>
            <p className="mt-2 text-gray-600">We've sent a password reset link to {email}</p>
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-500 text-center">
              Didn't receive an email? Check your spam folder or{" "}
              <button 
                onClick={() => setSuccess(false)} 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                try again
              </button>
            </p>
          </div>
          <div className="text-center">
            <Link href="/auth" className="font-medium text-blue-600 hover:text-blue-500">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-gray-600">Enter your email to receive a password reset link</p>
        </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
      </form>

      <div className="text-center mt-4">
        <Link href="/auth" className="text-blue-600 hover:text-blue-800">
          Back to Login
        </Link>
      </div>
    </div>
  </div>
  );
}
