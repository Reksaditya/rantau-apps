import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";

const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/roadmaps",
  "/assistant",
  "/forum",
  "/mentors",
  "/consultations",
  "/settings",
];

const AUTH_PATHS = ["/login", "/register"];

export async function updateSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } = getPublicEnv();
  if (!isSupabaseConfigured) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthRoute = AUTH_PATHS.some(
    (authPath) => pathname === authPath || pathname.startsWith(`${authPath}/`)
  );

  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

