"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuthSimplified";
import { AuthUser } from "@/hooks/useSupabaseAuthSimplified";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

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
  supabase: typeof supabase;  // Adding direct access to supabase client
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth();
  const [initialized, setInitialized] = useState(false);
  // This variable will hold the unsubscribe function returned by onAuthStateChange if available
  let unsubscribe: (() => void) | undefined;
  
  useEffect(() => {
    // Initialize auth state on load
    auth.refreshSession().then(() => setInitialized(true));
    
    // Setup auth state change listener using only supabase client
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      auth.refreshSession();
    });
    
    // Set up additional listener if onAuthStateChange is available in auth object
    if (auth.onAuthStateChange) {
      unsubscribe = auth.onAuthStateChange(() => {
        auth.refreshSession();
      });
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Include supabase client in the context value
  const contextValue = {
    ...auth,
    supabase
  };
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SupabaseProvider");
  }
  return context;
}
// No need to define setInitialized here as it's already defined in the useState hook above:
// const [initialized, setInitialized] = useState(false);

// There's also a duplicated useEffect hook outside the component which should be removed

