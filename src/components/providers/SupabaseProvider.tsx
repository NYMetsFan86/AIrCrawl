"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuthSimplified";
import { AuthUser } from "@/hooks/useSupabaseAuthSimplified";
import { Session } from "@supabase/supabase-js";

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  metadata: { [key: string]: any; name: string };
}

export interface SignInResponse {
  success: boolean;
  error?: { message: string };
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (credentials: SignInCredentials) => Promise<SignInResponse>;
  signUp: (credentials: SignUpCredentials) => Promise<SignInResponse>;
  signInWithOAuth: (provider: "google" | "github") => Promise<SignInResponse>;
  signOut: () => Promise<SignInResponse>;
  sendPasswordResetEmail: (email: string) => Promise<SignInResponse>;
  resetPassword: (newPassword: string) => Promise<SignInResponse>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
  onAuthStateChange?: (callback: () => void) => (() => void) | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth();
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize auth state on load
    auth.refreshSession().then(() => setInitialized(true));
    
    // Setup auth state change listener
    const unsubscribe = auth.onAuthStateChange && auth.onAuthStateChange(() => {
      auth.refreshSession();
    });
    
    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);
  
  if (!initialized && auth.loading) {
    // Don't render children until we've initialized auth
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SupabaseProvider");
  }
  return context;
}
