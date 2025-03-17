"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function GlobalNotFound() {
  // Remove any existing layouts from the body
  useEffect(() => {
    // Store original body content
    const originalContent = document.body.innerHTML;
    
    // Replace with our custom 404
    document.body.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'min-h-screen flex flex-col items-center justify-center bg-slate-100';
    document.body.appendChild(container);
    
    // Restore on cleanup
    return () => {
      document.body.innerHTML = originalContent;
    };
  }, []);

  return (
    <div className="max-w-md p-8 rounded-lg bg-white shadow-lg text-center">
      <h1 className="text-4xl font-bold mb-4">Halt!.. Who goes there?!?</h1>
      <div className="relative w-64 h-64 mx-auto my-6">
        <img src="/knight.png" alt="Knight Guard" className="w-full h-full object-contain" />
      </div>
      <p className="text-gray-600 mb-6">
        The page you seek does not exist in this realm.
      </p>
      <Link href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md">
        Return to safety
      </Link>
    </div>
  );
}