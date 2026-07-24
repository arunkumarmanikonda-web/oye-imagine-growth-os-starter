import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Oye !magine",
    template: "%s | Oye !magine",
  },
  description:
    "AI-first growth operating system for strategy, websites, SEO, paid media, analytics, marketplace delivery, and managed growth execution.",
  applicationName: "Oye !magine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900">
        <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
                O!
              </div>
              <div>
                <p className="text-base font-semibold tracking-tight text-slate-950">
                  Oye !magine
                </p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  AI-first Growth OS
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-3 md:flex">
              <Link
                href="/"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Home
              </Link>
              <Link
                href="/marketplace"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Marketplace
              </Link>
              <Link
                href="/admin/marketplace"
                className="oi-button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
              >
                Admin workspace
              </Link>
            </nav>
          </div>
        </div>

        <div>{children}</div>

        <footer className="mt-12 border-t border-slate-200/70 bg-white/70">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-950">
                Oye !magine
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                AI-first growth operating system for strategy, websites, SEO,
                paid media, analytics, specialist execution, and governed
                marketplace delivery.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <Link href="/" className="hover:text-slate-950">
                Home
              </Link>
              <Link href="/marketplace" className="hover:text-slate-950">
                Marketplace
              </Link>
              <Link href="/admin/marketplace" className="hover:text-slate-950">
                Admin marketplace
              </Link>
              <Link href="/login" className="hover:text-slate-950">
                Login
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}