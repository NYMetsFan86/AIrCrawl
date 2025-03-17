import React, { ReactNode } from 'react';

export const metadata = {
  title: 'AIrCrawl Login',
  description: 'Login and registration pages',
};
// Remove the CSS import as it's already imported in the root layout
// import '@/styles/globals.css';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-container flex flex-col justify-center items-center min-h-screen pt-0">
      {children}
    </div>
  );
}