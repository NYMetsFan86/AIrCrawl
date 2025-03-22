"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

// Create a context that provides the shared supabase instance and current session
export const SupabaseContext = createContext({
  supabase,
  session: null as Session | null,
  isLoading: true
});

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Use a general error handler instead of checking for a non-existent event type
    const { data: errorListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && session === null) {
        console.log("User signed out");
      }
      
      // Log any errors from session state
      if (session?.user?.app_metadata?.provider === 'email' && !session?.user?.email_confirmed_at) {
        console.warn("User email not confirmed");
      }
    });

    return () => {
      errorListener?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, session, isLoading: loading }}>
      {!loading ? children : <div>Loading authentication...</div>}
    </SupabaseContext.Provider>
  );
}

// Backward compatibility hook
export function useAuth() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SupabaseProvider");
  }
  
  const { supabase, session } = context;
  
  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { success: !error, data, error };
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
        options: { data: metadata }
      });
      return { success: !error, data, error };
    } catch (err) {
      console.error("Sign up error:", err);
      return { success: false, error: err as Error };
    }
  };
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { success: !error, error };
    } catch (err) {
      console.error("Sign out error:", err);
      return { success: false, error: err as Error };
    }
  };
  
  const signInWithOAuth = async ({ provider, redirectTo }: { provider: string; redirectTo?: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: redirectTo ? { redirectTo } : undefined
      });
      return { success: !error, data, error };
    } catch (err) {
      console.error("OAuth sign in error:", err);
      return { success: false, error: err as Error };
    }
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { success: !error, data, error };
    } catch (err) {
      console.error("Password reset email error:", err);
      return { success: false, error: err as Error };
    }
  };
  
  const resetPassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      return { success: !error, data, error };
    } catch (err) {
      console.error("Password reset error:", err);
      return { success: false, error: err as Error };
    }
  };
  
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      return { success: !error, data, error };
    } catch (err) {
      console.error("Session refresh error:", err);
      return { success: false, error: err as Error };
    }
  };
  
  return {
    supabase,
    session,
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    loading: false,
    error: null,
    refreshSession,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    sendPasswordResetEmail,
    resetPassword,
  };
}

// New hook that returns just the context
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}

