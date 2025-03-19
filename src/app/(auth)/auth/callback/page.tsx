import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('Authenticating...');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleHashFragment = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        router.push('/dashboard');
      } else {
        setMessage('Authentication failed');
        setTimeout(() => router.push('/auth?error=unknown_error'), 2000);
      }
    };

    handleHashFragment();
  }, [router, supabase.auth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Authentication</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
