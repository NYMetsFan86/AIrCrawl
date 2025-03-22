"use client";

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import '@/styles/globals.css'; 
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/navigation';
import SideNav from '@/components/nav/SideNav';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // We don't need to immediately redirect here because 
  // the middleware should handle most redirects
  // This is just a fallback safety measure
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-[#860808]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, render nothing (redirect will happen via useEffect)
  if (!user) {
    return null;
  }

  // Show layout with sidebar for authenticated users
  return (
    <div className={`flex h-screen ${inter.variable} font-sans`}>
      <aside className="w-64 bg-gray-100 border-r">
        <SideNav />
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
        <Toaster />
      </main>
    </div>
  );
}