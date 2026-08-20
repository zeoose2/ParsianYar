import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!url || !key) {
  console.warn("ParsianYar: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are not configured.");
}

export const supabase = createClient(url ?? "", key ?? "", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
