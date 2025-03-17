"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";

export type AuthUser = User;

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
        }
        
        // Set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log("Auth state changed:", event);
            if (newSession) {
              setSession(newSession);
              setUser(newSession.user);
              setIsAuthenticated(true);
            } else {
              setSession(null);
              setUser(null);
              setIsAuthenticated(false);
            }
            // Force refresh current route
            router.refresh();
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth hook error:", error);
        setError(error instanceof Error ? error : new Error('Authentication error'));
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
  }, [router, supabase.auth]);

  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error("Sign-in error:", error);
      return { success: false, error };
    }
  };

  const signInWithOAuth = async (provider: "google" | "github") => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error("OAuth sign-in error:", error);
      return { success: false, error };
    }
  };

  const signUp = async ({ email, password, name, metadata }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error("Sign-up error:", error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error("Sign-out error:", error);
      return { success: false, error };
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error("Password reset email error:", error);
      return { success: false, error };
    }
  };

  const resetPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error };
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Session refresh error:", error);
      setError(error instanceof Error ? error : new Error('Session refresh error'));
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    sendPasswordResetEmail,
    resetPassword,
    refreshSession,
    isAuthenticated,
  };
}
