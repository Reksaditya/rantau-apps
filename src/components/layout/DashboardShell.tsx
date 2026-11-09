"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  Map,
  Sparkles,
  MessagesSquare,
  Users,
  CalendarCheck,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Briefcase,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { PlanTier } from "@/types/database";
import { PLAN_ENTITLEMENTS } from "@/lib/subscription/entitlements";

interface DashboardShellProps {
  userFullName: string;
  userEmail: string;
  planTier: PlanTier;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix: string;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    matchPrefix: "/dashboard",
  },
  {
    href: "/roadmaps",
    label: "Roadmap Bisnis",
    icon: Map,
    matchPrefix: "/roadmaps",
  },
  {
    href: "/assistant",
    label: "AI Business Assistant",
    icon: Sparkles,
    matchPrefix: "/assistant",
  },
  {
    href: "/forum",
    label: "Forum Komunitas",
    icon: MessagesSquare,
    matchPrefix: "/forum",
  },
  {
    href: "/mentors",
    label: "Direktori Mentor",
    icon: Users,
    matchPrefix: "/mentors",
  },
  {
    href: "/consultations",
    label: "Konsultasi Saya",
    icon: CalendarCheck,
    matchPrefix: "/consultations",
  },
];

const SETTINGS_NAV_ITEMS: NavItem[] = [
  {
    href: "/onboarding",
    label: "Profil Bisnis",
    icon: Briefcase,
    matchPrefix: "/onboarding",
  },
  {
    href: "/settings/subscription",
    label: "Langganan & Kuota",
    icon: CreditCard,
    matchPrefix: "/settings/subscription",
  },
  {
    href: "/settings/profile",
    label: "Pengaturan Akun",
    icon: Settings,
    matchPrefix: "/settings/profile",
  },
];

export function DashboardShell({
  userFullName,
  userEmail,
  planTier,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const entitlement = PLAN_ENTITLEMENTS[planTier];
  const initials =
    userFullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "RN";

  async function handleLogout() {
    try {
      setLoggingOut(true);
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  function renderNavLinks(items: NavItem[]) {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive =
        pathname === item.href || pathname.startsWith(`${item.matchPrefix}/`);

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileMenuOpen(false)}
          className={`relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
            isActive
              ? "bg-[#E8F4F0] font-semibold text-[#1B8366]"
              : "font-medium text-[#52645D] hover:bg-[#F8FAF9] hover:text-[#172B25]"
          }`}
        >
          {isActive && (
            <span
              className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#1B8366]"
              aria-hidden="true"
            />
          )}
          <Icon
            className={`h-4 w-4 shrink-0 ${
              isActive ? "text-[#1B8366]" : "text-[#718078]"
            }`}
          />
          <span>{item.label}</span>
        </Link>
      );
    });
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAF9]">
      {/* Mobile Topbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E1E8E4] bg-[#FFFFFF] px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B8366] text-[#FFFFFF]">
            <Compass className="h-4 w-4" />
          </span>
          <span className="font-heading text-base font-bold text-[#172B25]">
            Rintis
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#E8F4F0] border border-[#B7DCCF] px-2.5 py-1 text-xs font-medium text-[#1B8366]">
            {entitlement.name}
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Buka menu navigasi"
            className="rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] p-2 text-[#172B25] cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#172B2566]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex w-[260px] flex-col justify-between bg-[#FFFFFF] border-r border-[#E1E8E4] p-4">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E1E8E4]">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B8366] text-[#FFFFFF]">
                    <Compass className="h-4 w-4" />
                  </span>
                  <div>
                    <span className="block font-heading text-base font-bold leading-none text-[#172B25]">
                      Rintis
                    </span>
                    <span className="text-[11px] text-[#718078]">
                      Temukan arah, bangun usahamu
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Tutup menu navigasi"
                  className="rounded-lg p-1.5 text-[#52645D] hover:bg-[#F8FAF9]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav aria-label="Menu utama mobile" className="mt-4 space-y-1">
                {renderNavLinks(MAIN_NAV_ITEMS)}
              </nav>

              <div className="mt-6 pt-4 border-t border-[#E1E8E4] space-y-1">
                <p className="px-3.5 pb-1 text-xs font-medium text-[#718078]">
                  Pengaturan & Profil
                </p>
                {renderNavLinks(SETTINGS_NAV_ITEMS)}
              </div>
            </div>

            <div className="border-t border-[#E1E8E4] pt-4">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F4F0] text-xs font-bold text-[#1B8366]">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#172B25]">
                    {userFullName}
                  </p>
                  <p className="truncate text-xs text-[#718078]">{userEmail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2 text-xs font-medium text-[#172B25] hover:bg-[#F8FAF9] cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{loggingOut ? "Keluar..." : "Keluar Akun"}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Fixed Sidebar (260px exact per DESIGN.md) */}
      <aside className="hidden lg:flex lg:w-[260px] lg:shrink-0 lg:flex-col lg:justify-between border-r border-[#E1E8E4] bg-[#FFFFFF] p-5 sticky top-0 h-screen">
        <div>
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B8366] text-[#FFFFFF]">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <span className="block font-heading text-lg font-bold leading-none text-[#172B25]">
                Rintis
              </span>
              <span className="text-[11px] font-medium text-[#718078]">
                Temukan arah, bangun usahamu
              </span>
            </div>
          </Link>

          <nav aria-label="Menu kerja utama" className="mt-8 space-y-1">
            {renderNavLinks(MAIN_NAV_ITEMS)}
          </nav>

          <div className="mt-6 pt-5 border-t border-[#E1E8E4] space-y-1">
            <p className="px-3.5 pb-1.5 text-xs font-medium text-[#718078]">
              Pengaturan & Usaha
            </p>
            {renderNavLinks(SETTINGS_NAV_ITEMS)}
          </div>
        </div>

        <div className="border-t border-[#E1E8E4] pt-4 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F4F0] border border-[#B7DCCF] text-xs font-bold text-[#1B8366]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#172B25]">
                {userFullName}
              </p>
              <span className="mt-0.5 inline-flex items-center rounded-md bg-[#E8F4F0] px-2 py-0.5 text-[11px] font-medium text-[#1B8366]">
                {entitlement.name}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-3 py-2 text-xs font-medium text-[#172B25] transition-colors hover:bg-[#F8FAF9] cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-[#52645D]" />
            <span>{loggingOut ? "Sedang keluar..." : "Keluar Akun"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

