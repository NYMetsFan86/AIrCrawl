"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Define proper types for the context
type SupabaseContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<{
    success: boolean;
    error?: Error;
  }>;
  signUp: (data: { email: string; password: string; [key: string]: any }) => Promise<{
    success: boolean;
    error?: Error;
  }>;
  signOut: () => Promise<void>;
  setServerSession: (session: Session | null) => void;
};

// Create the context with proper typing
export const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ success: false, error: new Error("Not implemented") }),
  signUp: async () => ({ success: false, error: new Error("Not implemented") }),
  signOut: async () => {},
  setServerSession: () => {}
});

export function SupabaseProvider({ 
  children,
  serverSession
}: { 
  children: ReactNode;
  serverSession?: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(serverSession || null);
  const [user, setUser] = useState<User | null>(serverSession?.user || null);
  const [loading, setLoading] = useState(serverSession ? false : true);
  const [supabase] = useState(() => createClientComponentClient());

  useEffect(() => {
    const getInitialSession = async () => {
      if (serverSession) {
        // Already have server session, no need to fetch again
        return;
      }
      
      setLoading(true);
      try {
        const { data: { session: clientSession } } = await supabase.auth.getSession();
        setSession(clientSession);
        setUser(clientSession?.user || null);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [serverSession, supabase.auth]);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { success: !error, data, error: error || undefined };
    } catch (err) {
      console.error("Sign in error:", err);
      return { success: false, error: err as Error };
    }
  };
  
  const signUp = async ({ email, password, ...metadata }: { email: string; password: string; [key: string]: any }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      return { success: !error, data, error: error || undefined };
    } catch (err) {
      console.error("Sign up error:", err);
      return { success: false, error: err as Error };
    }
  };
  
  const signOut = async () => {
    await supabase.auth.signOut();
    // No need to set user/session to null here because the auth listener will handle it
  };
  
  // Function to set server session (useful for server components)
  const setServerSession = (newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user || null);
    setLoading(false);
  };

  const value = {
    user,
    session,
    isLoading: loading,
    signIn,
    signUp,
    signOut,
    setServerSession
  };

  return (
    <SupabaseContext.Provider value={value}>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-[#860808]"></div>
        </div>
      ) : (
        children
      )}
    </SupabaseContext.Provider>
  );
}

// Simplified hook for accessing auth context
export function useAuth() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SupabaseProvider");
  }
  return context;
}