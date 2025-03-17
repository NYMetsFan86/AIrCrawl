import { type Session } from "next-auth";

/**
 * Check if a user is authenticated based on the session
 */
export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user;
}

/**
 * Get the current user's ID from the session
 */
export function getUserId(session: Session | null): string | null {
  return session?.user?.id || null;
}

/**
 * Check if the user has a specific role
 */
export function hasRole(session: Session | null, role: string): boolean {
  return session?.user?.role === role;
}

/**
 * Get user's name or email for display
 */
export function getUserDisplayName(session: Session | null): string {
  if (!session?.user) return "Guest";
  return session.user.name || session.user.email || "User";
}
