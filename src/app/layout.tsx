import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rantau — Temukan arah, bangun usahamu.",
  description:
    "Platform pendamping bisnis berbasis AI yang membantu entrepreneur memulai dan mengembangkan usaha melalui roadmap terstruktur, asisten AI kontekstual, komunitas, dan konsultasi mentor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${dmSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAF9] text-[#172B25]">
        {children}
      </body>
    </html>
  );
}
