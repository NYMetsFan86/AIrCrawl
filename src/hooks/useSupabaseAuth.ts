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

  // Sign in with email and password
  const signIn = useCallback(
    async ({ email, password }: SignInCredentials) => {
      try {
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }
        
        await refreshSession();
        return true;
      } catch (err) {
        console.error('Sign in error:', err);
        setError(err instanceof Error ? err : new Error('Failed to sign in'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase, refreshSession]
  );

  // Sign up with email and password
  const signUp = useCallback(
    async ({ email, password, name }: SignUpCredentials) => {
      try {
        setLoading(true);
        setError(null);

        // Register new user
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        // Add user profile data
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                name: name,
                role: 'member', // Default role
              },
            ]);

          if (profileError) {
            console.error('Error creating user profile:', profileError);
          }
        }

        return true;
      } catch (err) {
        console.error('Sign up error:', err);
        setError(err instanceof Error ? err : new Error('Failed to sign up'));
        return false;
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
