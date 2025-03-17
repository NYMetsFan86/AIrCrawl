import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const createSupabaseClientClient = () => {
  return createClientComponentClient();
};
