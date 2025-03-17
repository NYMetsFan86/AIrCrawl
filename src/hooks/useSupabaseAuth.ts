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

type SupabaseAuthError = {
  message: string;
};

type SignInCredentials = {
  email: string;
  password: string;
};

type SignUpCredentials = SignInCredentials & {
  name: string;
  metadata: {
    name: string;
    [key: string]: any;
  };
};

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Initialize the auth state from Supabase
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
        
        // Get user profile data
        const { data: userProfile } = await supabase
          .from('users')
          .select('id, name, role, avatar_url')
          .eq('id', session.user.id)
          .single();
        
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: userProfile?.name || session.user.user_metadata.name || null,
          role: userProfile?.role || 'member',
          avatarUrl: userProfile?.avatar_url || session.user.user_metadata.avatar_url,
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

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      refreshSession();
    });

    // Initialize on mount
    refreshSession();

    return () => subscription.unsubscribe();
  }, [supabase, refreshSession]);

  interface SignInResponse {
    success: boolean;
    error?: {
      message: string;
    };
  }

  // Sign in with email and password
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
          const errorMessage = error.message === 'Invalid login credentials' 
            ? 'Invalid login credentials. Please check your email and password.'
            : error.message;
          
          setError(new Error(errorMessage));
          return { 
            success: false, 
            error: { message: errorMessage } 
          };
        }
        
        // Make sure session is fully established before redirecting
        await refreshSession();
        
        // Ensure we have the session before redirecting
        if (data.session) {
          console.log("Authentication successful, redirecting to dashboard");
          
          // Small timeout to ensure auth state is propagated
          setTimeout(() => {
            router.push('/dashboard');
          }, 500);
        } else {
          console.error("Session not established after login");
          return {
            success: false,
            error: { message: "Failed to establish session" }
          };
        }
        
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
    [supabase, refreshSession, router]
  );

  // Sign up with email and password
  interface SignUpResponse {
    success: boolean;
    data?: {
      user: User | null;
      session: Session | null;
    };
    error?: {
      message: string;
    };
  }

  const signUp = useCallback(
    async ({ email, password, metadata }: SignUpCredentials): Promise<SignUpResponse> => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          },
        });

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error('User data not available after signup');
        }

        // Create user profile record
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email,
                name: metadata.name,
                // Add any other profile fields you need
                created_at: new Date().toISOString(),
              },
            ]);

          if (profileError) {
            throw profileError;
          }
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
          throw new Error(`Error creating user profile: ${JSON.stringify(profileError)}`);
        }

        return { success: true, data };
      } catch (error: any) {
        console.error('Registration error:', error);
        return { success: false, error: { message: error?.message || 'Registration failed' } };
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Sign in with OAuth provider
  const signInWithOAuth = useCallback(
    async (provider: 'google' | 'github') => {
      try {
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        return true;
      } catch (err) {
        console.error(`${provider} sign in error:`, err);
        setError(err instanceof Error ? err : new Error(`Failed to sign in with ${provider}`));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Send password reset email
  const sendPasswordResetEmail = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
          throw new Error(error.message);
        }

        return true;
      } catch (err) {
        console.error('Password reset error:', err);
        setError(err instanceof Error ? err : new Error('Failed to send password reset email'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Reset password with token
  const resetPassword = useCallback(
    async (newPassword: string) => {
      try {
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          throw new Error(error.message);
        }

        return true;
      } catch (err) {
        console.error('Password update error:', err);
        setError(err instanceof Error ? err : new Error('Failed to update password'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      setUser(null);
      setSession(null);
      router.push('/auth');
      return true;
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

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
