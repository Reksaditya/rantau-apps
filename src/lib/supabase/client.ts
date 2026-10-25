import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";

export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } = getPublicEnv();

  if (!isSupabaseConfigured) {
    throw new Error(
      "Konfigurasi Supabase belum ditemukan. Harap lengkapi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY pada file .env.local."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

