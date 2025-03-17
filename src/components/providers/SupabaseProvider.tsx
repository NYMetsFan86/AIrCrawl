"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { AuthUser } from "@/hooks/useSupabaseAuth";
import { Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (credentials: { email: string; password: string }) => Promise<boolean>;
  signUp: (credentials: { email: string; password: string; name: string }) => Promise<boolean>;
  signInWithOAuth: (provider: "google" | "github") => Promise<boolean>;
  signOut: () => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth();
  
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SupabaseProvider");
  }
  return context;
}
