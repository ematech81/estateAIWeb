import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Self-hosted at build time by Next.js (no runtime request to Google Fonts).
// Exposed as a CSS variable and wired into Tailwind's `font-sans` in
// tailwind.config.ts, so `font-sans` (the default body font) is Inter
// everywhere per DESIGN.md ("utilizes Inter exclusively").
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'EstateAI — Find Properties. List From Anywhere.',
  description: 'AI-powered global property finder and real estate agency marketplace.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      {/* Material Symbols isn't in next/font's curated set, so it's loaded
          the standard way; React 19 (used by Next 15's App Router) hoists
          any <link> rendered here into <head> automatically, and — because
          this is the root layout — that makes it global, not per-page,
          despite the App-Router-unaware "add it to _document.js" ESLint
          warning this triggers (there is no _document.js in App Router). */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        rel="stylesheet"
      />
      <body className="bg-background font-sans text-on-surface antialiased">{children}</body>
    </html>
  );
}
