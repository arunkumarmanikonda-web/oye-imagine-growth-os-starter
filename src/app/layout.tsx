import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oye !magine",
  description: "AI-first Growth OS for customer-facing delivery and operator-grade execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="oi-shell">
          <header className="oi-topbar">
            <div className="oi-container oi-topbar-inner">
              <Link href="/" className="oi-brand-lockup" aria-label="Oye !magine home">
                <span className="oi-brand-mark-wrap">
                  <Image
                    src="/brand/oye-symbol.png"
                    alt="Oye !magine"
                    width={48}
                    height={48}
                    className="oi-brand-symbol"
                    priority
                  />
                </span>
                <span className="oi-brand-copy">
                  <span className="oi-brand-name">Oye !magine</span>
                  <span className="oi-brand-tag">AI-first Growth OS</span>
                </span>
              </Link>

              <nav className="oi-nav" aria-label="Primary">
                <Link href="/" className="oi-nav-link">Home</Link>
                <Link href="/marketplace" className="oi-nav-link">Marketplace</Link>
                <Link href="/login" className="oi-nav-link">Login</Link>
              </nav>

              <div className="oi-topbar-actions">
                <Link href="/login" className="oi-btn oi-btn-ghost">Sign in</Link>
                <Link href="/admin" className="oi-btn oi-btn-primary">Admin workspace</Link>
              </div>
            </div>
          </header>

          <main className="oi-main">{children}</main>

          <footer className="oi-footer">
            <div className="oi-container oi-footer-inner">
              <div className="oi-footer-brand">
                <Image
                  src="/brand/oye-logo-dark.png"
                  alt="Oye !magine"
                  width={220}
                  height={62}
                  className="oi-footer-logo"
                  priority
                />
                <p className="oi-footer-copy">
                  Growth infrastructure built for brands that need clarity, speed, and accountable execution.
                </p>
              </div>

              <div className="oi-footer-grid">
                <div>
                  <p className="oi-footer-heading">Product</p>
                  <Link href="/" className="oi-footer-link">Overview</Link>
                  <Link href="/marketplace" className="oi-footer-link">Marketplace</Link>
                  <Link href="/login" className="oi-footer-link">Client access</Link>
                </div>
                <div>
                  <p className="oi-footer-heading">Admin</p>
                  <Link href="/admin" className="oi-footer-link">Workspace</Link>
                  <Link href="/admin/marketplace" className="oi-footer-link">Marketplace admin</Link>
                  <Link href="/admin/ops" className="oi-footer-link">Operations console</Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}