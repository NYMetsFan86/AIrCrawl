// src/app/not-found.tsx

import React from 'react';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-2 text-lg text-gray-500">Sorry, the page you are looking for does not exist.</p>
    </div>
  );
}
