import React, { ReactNode } from 'react';

export const metadata = {
  title: 'AIrCrawl Login',
  description: 'Login and registration pages',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  // NO HTML/BODY TAGS HERE
  return (
    <div className="auth-container flex flex-col justify-center items-center min-h-screen pt-0">
      {children}
    </div>
  );
}