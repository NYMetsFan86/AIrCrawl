// src/components/auth/withAuth.tsx
"use client";
import { useAuth } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface WithAuthProps {
  children: ReactNode;
}

export function WithAuth({ children }: WithAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;
  if (!user) {
    router.push("/auth");
    return null;
  }

  return <>{children}</>;
}