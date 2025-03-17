"use client";

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SideNav from '../nav/SideNav';
import { redirect } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  
  // If not authenticated and not loading, redirect to auth page
  if (!session && status !== "loading") {
    redirect('/auth');
    return null;
  }

  // For loading state
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Once authenticated, show the layout with sidebar
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