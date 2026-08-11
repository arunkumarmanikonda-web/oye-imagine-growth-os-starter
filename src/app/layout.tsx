import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { buildFooterMeta } from "@/lib/foundation/public-shell";

export const metadata: Metadata = {
  title: {
    default: "Oye !magine",
    template: "%s | Oye !magine",
  },
  description: "AI-native digital marketing services with premium public, client, and operator surfaces.",
};

const footerMeta = buildFooterMeta();

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="oi-shell">
          <header className="oi-topbar">
            <div
  className="oi-container"
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap"
  }}
>
              <Link className="oi-brand" href="/">
                Oye !magine
              </Link>

              <nav className="oi-nav" aria-label="Primary" style={{ flexWrap: "wrap", rowGap: 8 }}>
                <Link href="/platform">Platform</Link>
                <Link href="/marketplace">Marketplace</Link>
                <Link href="/solutions">Solutions</Link>
                <Link href="/login/client">Client login</Link>
                <a href="mailto:hello@oyeimagine.com">Contact</a>
              </nav>

              <div
  style={{
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "stretch"
  }}
>
                <a
  className="oi-btn oi-btn--secondary"
  href="mailto:hello@oyeimagine.com"
  style={{ flex: "1 1 220px", minWidth: 0, justifyContent: "center" }}
>
                  hello@oyeimagine.com
                </a>
                <Link
  className="oi-btn oi-btn--primary"
  href="/marketplace"
  style={{ flex: "1 1 180px", minWidth: 0, justifyContent: "center" }}
>
                  Explore marketplace
                </Link>
              </div>
            </div>
          </header>

          <main className="oi-main">{props.children}</main>

          <footer>
            <div className="oi-container" style={{ paddingTop: 24, paddingBottom: 36 }}>
              <div className="oi-grid oi-grid--two">
                <article className="oi-card">
                  <div className="oi-card-title">Oye !magine</div>
                  <p className="oi-page-subtitle" style={{ marginTop: 8 }}>
                    Premium digital growth systems, managed delivery, client-ready reporting, and admin-controlled content surfaces.
                  </p>
                </article>

                <article className="oi-card">
                  <div className="oi-card-title">Legal and support identity</div>
                  <div className="oi-meta-line" style={{ marginTop: 12 }}>
                    <strong>Legal name:</strong> {footerMeta.legalName}
                  </div>
                  <div className="oi-meta-line" style={{ marginTop: 8 }}>
                    <strong>GSTIN:</strong> {footerMeta.gstin}
                  </div>
                  <div className="oi-meta-line" style={{ marginTop: 8 }}>
                    <strong>CIN:</strong> {footerMeta.cin}
                  </div>
                  <div className="oi-meta-line" style={{ marginTop: 8 }}>
                    <strong>Email:</strong> {footerMeta.supportEmail}
                  </div>
                  <div className="oi-meta-line" style={{ marginTop: 8 }}>
                    <strong>Phone:</strong> {footerMeta.supportPhone}
                  </div>
                </article>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

