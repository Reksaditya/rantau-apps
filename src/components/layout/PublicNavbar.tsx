import Link from "next/link";
import { Compass } from "lucide-react";

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
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold leading-none text-[#172B25]">
              Rantau
            </span>
            <span className="text-[11px] font-medium text-[#718078]">
              Temukan arah, bangun usahamu
            </span>
          </div>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#52645D]"
        >
          <Link
            href="/#cara-kerja"
            className="transition-colors hover:text-[#172B25]"
          >
            Cara Kerja
          </Link>
          <Link
            href="/#fitur"
            className="transition-colors hover:text-[#172B25]"
          >
            Fitur Pendamping
          </Link>
          <Link
            href="/pricing"
            className="transition-colors hover:text-[#172B25]"
          >
            Paket Langganan
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-[#1B8366] px-4 py-2 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#166B53] active:bg-[#125642]"
            >
              Buka Dashboard
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
    <footer className="border-t border-[#E1E8E4] bg-[#FFFFFF] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B8366] text-[#FFFFFF]">
                <Compass className="h-4 w-4" />
              </span>
              <span className="font-heading text-lg font-bold text-[#172B25]">
                Rantau
              </span>
            </div>
            <p className="mt-2 max-w-md text-sm text-[#52645D]">
              Platform pendamping bisnis berbasis AI, diskusi komunitas, dan
              konsultasi mentor untuk mengubah ide menjadi langkah nyata.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm font-medium text-[#52645D]">
            <Link href="/" className="hover:text-[#172B25]">
              Beranda
            </Link>
            <Link href="/pricing" className="hover:text-[#172B25]">
              Harga & Paket
            </Link>
            <Link href="/login" className="hover:text-[#172B25]">
              Masuk Akun
            </Link>
            <Link href="/register" className="hover:text-[#172B25]">
              Daftar Gratis
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-[#E1E8E4] pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-[#718078]">
          <p>© {new Date().getFullYear()} Rantau. Hak cipta dilindungi.</p>
          <p>
            Dirancang untuk entrepreneur muda dan pelaku UMKM di seluruh
            Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
}

