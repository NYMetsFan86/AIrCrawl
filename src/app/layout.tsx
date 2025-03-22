import { Inter } from 'next/font/google';
import '@/styles/globals.css'; 
import { Toaster } from '@/components/ui/toaster';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider';
import { headers, cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'AIrCrawl - AI-Powered Content Intelligence',
  description: 'Discover, analyze, and protect your digital content across the web with advanced AI detection and monitoring.'
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session on server (if available) to hydrate the client provider
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="bg-gray-50 min-h-screen">
        <SupabaseProvider serverSession={session}>
          {children}
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  );
}