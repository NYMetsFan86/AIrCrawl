import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient(cookieStore = cookies()) {
  const actualCookieStore = await cookieStore;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return actualCookieStore.get(name)?.value;
        },
        set(name, value, options) {
          actualCookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          actualCookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
