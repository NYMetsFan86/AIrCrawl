import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';

export default async function Home() {
  // Initialize Supabase client
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Sample code showing how to use Supabase client
  // const { data: userData } = await supabase.from('users').select()
  
  // Keep the original redirect
  redirect('/auth');
}