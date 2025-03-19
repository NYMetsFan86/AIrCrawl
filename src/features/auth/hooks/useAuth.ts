import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/hooks/useSupabaseAuthSimplified";
import { AuthUser, LoginCredentials } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;
      setUser(user ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || null,
      } : null);
    } catch (err) {
      console.error('Error refreshing user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Authentication failed'));
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };
}