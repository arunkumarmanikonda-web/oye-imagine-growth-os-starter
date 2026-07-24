import type { Metadata } from "next";
import Image from "next/image";
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
      <body className="oi-body">
        <div className="oi-app-frame">
          <header className="oi-topbar">
            <div className="oi-topbar-shell">
              <div className="flex min-w-0 items-center gap-4">
                <Link href="/" className="oi-brand-lockup" aria-label="Oye !magine home">
                  <Image
                    src="/brand/oye-logo-light.png"
                    alt="Oye !magine"
                    width={220}
                    height={64}
                    priority
                    className="h-10 w-auto object-contain md:h-11"
                  />
                </Link>

                <div className="hidden h-8 w-px bg-slate-200 lg:block" />
                <p className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 lg:block">
                  AI-first Growth OS
                </p>
              </div>

              <div className="flex items-center gap-3">
                <nav className="hidden items-center gap-2 md:flex">
                  <Link href="/" className="oi-nav-link">
                    Home
                  </Link>
                  <Link href="/marketplace" className="oi-nav-link">
                    Marketplace
                  </Link>
                  <Link href="/login" className="oi-nav-link">
                    Login
                  </Link>
                </nav>

                <Link href="/admin" className="oi-button-primary px-4 py-2 text-sm font-semibold">
                  Open admin workspace
                </Link>
              </div>
            </div>
          </header>

          <div className="oi-page">{children}</div>

          <footer className="oi-footer">
            <div className="oi-footer-shell">
              <div className="max-w-2xl">
                <Image
                  src="/brand/oye-logo-light.png"
                  alt="Oye !magine"
                  width={220}
                  height={64}
                  className="h-9 w-auto object-contain"
                />
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  AI-first growth operating system for strategy, websites, SEO,
                  paid media, analytics, specialist execution, and governed
                  marketplace delivery.
                </p>
              </div>

              <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <Link href="/" className="oi-footer-link">Home</Link>
                <Link href="/marketplace" className="oi-footer-link">Marketplace</Link>
                <Link href="/admin" className="oi-footer-link">Admin workspace</Link>
                <Link href="/login" className="oi-footer-link">Login</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}