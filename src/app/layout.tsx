import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EstateAI — List Your Property',
  description: 'AI-powered property finder and Nigerian agent marketplace.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
