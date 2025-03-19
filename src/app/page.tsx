'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  useEffect(() => {
    // Check if there's an auth code in the URL
    const code = searchParams?.get('code');
    
    if (code) {
      const handleCode = async () => {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Auth error:', error);
            router.push('/auth?error=Authentication_failed');
            return;
          }
          
          router.push('/dashboard');
        } catch (err) {
          console.error('Error handling auth code:', err);
          router.push('/auth?error=Authentication_failed');
        }
      };
      
      handleCode();
    }
  }, [router, searchParams, supabase.auth]);

  // Regular home page content
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <img src="/logo.png" alt="AIrCrawl Logo" className="mb-6 w-max h-32" />
      <h1 className="text-4xl font-bold">Welcome to AIrCrawl</h1>
      <p className="mt-4">"Content Intelligence""</p>
      <a href="/auth" className="mt-8 px-4 py-2 bg-maroon-600 text-white rounded hover:bg-maroon-700">
        Sign In
      </a>
    </div>
  );
}