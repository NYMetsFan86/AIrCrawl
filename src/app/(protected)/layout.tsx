"use client";

import { Inter } from 'next/font/google';
import '@/styles/globals.css'; 
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { redirect } from 'next/navigation';
import SideNav from '@/components/nav/SideNav';
import { useEffect } from 'react';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  
  // Add debug logging
  useEffect(() => {
    console.log('Protected layout auth status:', { user, loading });
  }, [user, loading]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // If not authenticated, redirect to auth
  if (!user) {
    redirect('/auth');
    return null;
  }

  // Show layout with sidebar for authenticated users
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 border-r">
        <SideNav />
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}