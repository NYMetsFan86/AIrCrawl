'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from "@/components/providers/SupabaseProvider";

export default function Logout() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      await signOut();
      // Clear any remaining client-side data
      localStorage.clear();
      sessionStorage.clear();
      router.push('/auth');
    };
    
    performLogout();
  }, [router, signOut]);

  return <div>Logging out...</div>;
}