import type { Metadata } from "next";
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: "Oye !magine",
    template: "%s | Oye !magine",
  },
  description:
    "AI-first growth operating system for strategy, websites, SEO, paid media, analytics, marketplace delivery, and managed growth execution.",
  applicationName: "Oye !magine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
