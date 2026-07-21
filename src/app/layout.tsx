import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Oye !magine Growth OS Starter',
  description: 'Starter setup for Vercel + Supabase + Resend + SMS + WhatsApp gateway'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
