import Link from "next/link";
import { Compass, ArrowUpRight } from "lucide-react";

interface PublicNavbarProps {
  isAuthenticated?: boolean;
}

export function PublicNavbar({ isAuthenticated = false }: PublicNavbarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#E1E8E4] bg-[#FFFFFF]">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B8366] text-[#FFFFFF]">
            <Compass className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-[#172B25]">
            Rintis
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#52645D]"
        >
          <Link
            href="/#fitur"
            className="transition-colors hover:text-[#172B25]"
          >
            Fitur
          </Link>
          <Link
            href="/#cara-kerja"
            className="transition-colors hover:text-[#172B25]"
          >
            Cara Kerja
          </Link>
          <Link
            href="/pricing"
            className="transition-colors hover:text-[#172B25]"
          >
            Harga
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1B8366] px-4 py-2 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#166B53] active:bg-[#125642]"
            >
              <span>Dashboard</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-[#C8D4CE] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#172B25] transition-colors hover:bg-[#F8FAF9]"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-4 py-2 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#166B53] active:bg-[#125642]"
              >
                Mulai Gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E1E8E4] bg-[#FFFFFF]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B8366] text-[#FFFFFF]">
              <Compass className="h-4 w-4" />
            </span>
            <div>
              <span className="font-heading text-base font-bold text-[#172B25]">
                Rintis
              </span>
              <p className="text-xs text-[#718078]">
                Temukan arah, bangun usahamu.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-[#52645D]">
            <Link href="/#fitur" className="hover:text-[#172B25]">
              Fitur
            </Link>
            <Link href="/#cara-kerja" className="hover:text-[#172B25]">
              Cara Kerja
            </Link>
            <Link href="/pricing" className="hover:text-[#172B25]">
              Harga
            </Link>
            <Link href="/login" className="hover:text-[#172B25]">
              Masuk
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-[#E1E8E4] pt-6 text-xs text-[#718078]">
          © {new Date().getFullYear()} Rintis. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
