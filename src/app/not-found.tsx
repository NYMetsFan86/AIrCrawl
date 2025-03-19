// src/app/not-found.tsx

"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Updated import

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the 404.html file
    router.replace('/404.html');
  }, [router]);

  return null; // Render nothing as the user is redirected
}
