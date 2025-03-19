"use client"; // Required for Next.js App Router

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Fix: Correct import for App Router

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard"); // Redirect to Dashboard
  }, [router]);

  return <div>Redirecting...</div>;
}
