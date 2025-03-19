import { NextResponse } from 'next/server';
import { supabase } from '@/hooks/useSupabaseAuthSimplified';

export async function GET() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || null,
  });
}