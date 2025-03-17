import { useState, useCallback, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { AuthUser, LoginCredentials } from '@/types';
import { ApplicationError, ErrorCode, showErrorToast } from '@/lib/error-utils';

export function useAuth() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Sync user state with session
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: (session.user as any).id,
        email: session.user.email || undefined,
        name: session.user.name || undefined
      });
      setLoading(false);
    } else if (status === 'unauthenticated') {
      setUser(null);
      setLoading(false);
    }
  }, [session, status]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
        remember: credentials.remember
      });

      if (result?.error) {
        throw new ApplicationError(
          result.error, 
          ErrorCode.AUTHENTICATION as unknown as number
        );
      }

      // Get user details
      await refreshUser();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Authentication failed'));
      showErrorToast(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/auth' });
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        if (userData?.id) {
          setUser(userData);
          return userData;
        }
      }
      
      setUser(null);
      return null;
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err : new Error('Failed to authenticate'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user
  };
}