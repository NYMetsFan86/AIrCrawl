"use client";

import { useAuth } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import { ComponentType, useEffect } from "react";

export default function withAuth<P extends object>(Component: ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth');
      }
    }, [user, loading, router]);

    if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}