'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    signOut({ callbackUrl: '/auth' }).then(() => {
      // Clear cookies and local storage
      document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.clear();
      router.push('/auth');
    });
  }, [router]);

  return <div>Logging out...</div>;
}