'use client';

import { useState } from 'react';

// The one piece of this page that needs client interactivity — isolated
// here so app/blog/[slug]/page.tsx can stay a Server Component. Both
// actions are genuinely functional with zero backend: the Web Share API
// (falling back to copying the link) and a real mailto: link. No
// "Save Article" — there's no bookmarking system built, and this app
// doesn't ship inert buttons for things that don't exist yet.
export function ShareBar({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled the native share sheet — not an error worth surfacing.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const mailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-4 border-t border-border-gray-200 pt-6">
      <span className="label-md font-medium text-on-surface-variant">Share this insight:</span>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share"
        title={copied ? 'Link copied!' : 'Share'}
        className="rounded border border-border-gray-200 bg-surface-gray-50 p-2 text-on-surface transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined">{copied ? 'check' : 'share'}</span>
      </button>
      <a
        href={mailHref}
        aria-label="Share via email"
        className="rounded border border-border-gray-200 bg-surface-gray-50 p-2 text-on-surface transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined">mail</span>
      </a>
    </div>
  );
}
