export interface PublicEnvConfig {
  appUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isSupabaseConfigured: boolean;
}

export interface ServerEnvConfig extends PublicEnvConfig {
  supabaseServiceRoleKey: string;
  geminiApiKey: string;
  geminiModel: string;
  isGeminiConfigured: boolean;
}

function isPlaceholder(value: string | undefined): boolean {
  if (!value || value.trim() === "") return true;
  const lower = value.toLowerCase();
  return (
    lower.includes("your-project-id") ||
    lower.includes("your-supabase") ||
    lower.includes("your-gemini")
  );
}

export function getPublicEnv(): PublicEnvConfig {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const isSupabaseConfigured =
    !isPlaceholder(supabaseUrl) &&
    !isPlaceholder(supabaseAnonKey) &&
    supabaseUrl.startsWith("http");

  return {
    appUrl,
    supabaseUrl,
    supabaseAnonKey,
    isSupabaseConfigured,
  };
}

export function getServerEnv(): ServerEnvConfig {
  const publicEnv = getPublicEnv();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const geminiApiKey = process.env.GEMINI_API_KEY || "";
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const isGeminiConfigured = !isPlaceholder(geminiApiKey);

  return {
    ...publicEnv,
    supabaseServiceRoleKey,
    geminiApiKey,
    geminiModel,
    isGeminiConfigured,
  };
}

export function assertSupabaseConfigured(): {
  supabaseUrl: string;
  supabaseAnonKey: string;
} {
  const { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } = getPublicEnv();
  if (!isSupabaseConfigured) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY telah diisi pada file .env.local sesuai panduan .env.example."
    );
  }
  return { supabaseUrl, supabaseAnonKey };
}

export function assertGeminiConfigured(): {
  geminiApiKey: string;
  geminiModel: string;
} {
  const { geminiApiKey, geminiModel, isGeminiConfigured } = getServerEnv();
  if (!isGeminiConfigured) {
    throw new Error(
      "Konfigurasi Google Gemini API belum lengkap. Pastikan GEMINI_API_KEY telah diisi pada file .env.local sesuai panduan .env.example."
    );
  }
  return { geminiApiKey, geminiModel };
}

