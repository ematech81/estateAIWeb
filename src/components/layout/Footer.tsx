import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund Policy', href: '/refund-policy' },
  // Already a real, built page — this was just never pointed at it (the
  // AgentSidebar's equivalent link was fixed earlier; this public footer
  // one was missed at the time).
  { label: 'Help Center', href: '/help' },
];

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border-gray-200 bg-surface-gray-50">
      <div className="container-app flex flex-col items-center justify-between gap-stack-md py-stack-lg md:flex-row">
        <Link href="/" className="headline-md flex items-center gap-2 text-primary">
          <span
            className="material-symbols-outlined text-growth-emerald-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            real_estate_agent
          </span>
          EstateAI
        </Link>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="label-md text-on-surface-variant transition-colors hover:text-secondary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="label-md text-center text-on-surface md:text-right">
          © {new Date().getFullYear()} EstateAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
