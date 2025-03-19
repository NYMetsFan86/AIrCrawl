// src/app/not-found.tsx

"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div style={{
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f4f4f4',
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ marginTop: '50px' }}>
        <h1>Halt!.. Who goes there?!?</h1>
        <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto' }}>
          <Image 
            src="/knight.png" 
            alt="Knight Image" 
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <p>the page you seek does not exist in this realm.</p>
        <Link href="/auth" style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007BFF',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Back to Safety
        </Link>
      </div>
    </div>
  );
}