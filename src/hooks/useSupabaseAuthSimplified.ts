import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  role?: string;
  avatarUrl?: string | null;
};

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  name: string;
  metadata: {
    name: string;
    [key: string]: any;
  };
}

export interface SignInResponse {
  success: boolean;
  error?: {
    message: string;
  };
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (session) {
        setSession(session);
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || null,
          role: session.user.user_metadata?.role || 'member',
          avatarUrl: session.user.user_metadata?.avatar_url || null,
        });
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (err) {
      console.error('Error refreshing auth session:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh session'));
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      refreshSession();
    });

    refreshSession();
    return () => subscription.unsubscribe();
  }, [supabase, refreshSession]);

  const signIn = useCallback(
    async ({ email, password }: SignInCredentials): Promise<SignInResponse> => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(new Error(error.message));
          return { 
            success: false, 
            error: { message: error.message } 
          };
        }
        
        await refreshSession();
        
        return { success: true };
      } catch (err) {
        console.error('Sign in error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
        setError(err instanceof Error ? err : new Error(errorMessage));
        return { 
          success: false, 
          error: { message: errorMessage } 
        };
      } finally {
        setLoading(false);
      }
    },
    [supabase, refreshSession]
  );

  const signUp = useCallback(
    async ({ email, password, metadata }: SignUpCredentials): Promise<SignInResponse> => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) {
          return {
            success: false, 
            error: { message: error.message }
          };
        }

        return { success: true };
      } catch (error: any) {
        console.error('Registration error:', error);
        return { 
          success: false, 
          error: { message: error?.message || 'Registration failed' } 
        };
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const signInWithOAuth = useCallback(
    async (provider: 'google' | 'github') => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        return { success: true };
      } catch (error: any) {
        console.error(`${provider} sign in error:`, error);
        return { 
          success: false, 
          error: { message: error?.message || `Failed to sign in with ${provider}` } 
        };
      }
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { 
        success: false, 
        error: { message: error?.message || 'Failed to sign out' } 
      };
    }
  }, [supabase]);

  const sendPasswordResetEmail = useCallback(
    async (email: string) => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) throw error;
        return { success: true };
      } catch (error: any) {
        console.error('Password reset error:', error);
        return { 
          success: false, 
          error: { message: error?.message || 'Failed to send password reset email' } 
        };
      }
    },
    [supabase]
  );

  const resetPassword = useCallback(
    async (newPassword: string) => {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;
        return { success: true };
      } catch (error: any) {
        console.error('Password update error:', error);
        return { 
          success: false, 
          error: { message: error?.message || 'Failed to update password' } 
        };
      }
    },
    [supabase]
  );

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
    isAuthenticated: !!session,
  };
}
