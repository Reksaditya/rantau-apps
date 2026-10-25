import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/lib/env";

export async function createServerSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } = getPublicEnv();

  if (!isSupabaseConfigured) {
    throw new Error(
      "Konfigurasi Supabase belum ditemukan di server. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY telah diatur pada .env.local."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dipanggil dari Server Component; penyegaran cookie ditangani oleh middleware.
        }
      },
    },
  });
}

