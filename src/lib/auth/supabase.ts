import { supabase } from '@/lib/supabase/client';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getServerSession() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getServerUser() {
  const session = await getServerSession();
  return session?.user || null;
}

export async function requireAuth() {
  const user = await getServerUser();
  
  if (!user) {
    redirect('/auth?message=Please sign in to access this page');
  }
  
  return user;
}

export async function redirectIfAuthenticated() {
  const session = await getServerSession();
  
  if (session) {
    redirect('/dashboard');
  }
}