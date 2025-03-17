import { Inter } from 'next/font/google';
import '@/styles/globals.css'; 
import { Toaster } from '@/components/ui/toaster';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body>
        <SupabaseProvider>
          {children}
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  );
}