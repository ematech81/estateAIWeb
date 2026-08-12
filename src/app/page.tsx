'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { api, ApiClientError } from '@/lib/api';
import type { PublicProperty } from '@/types/property';

// Phase 2 consumer search homepage — supersedes the earlier Phase 1
// agent-recruitment "/" page per an explicit decision to open consumer
// search now rather than wait for full Nigerian inventory density (see
// AI_Property_Finder_Master_Build_Prompt_v2.md Section 5 for the sequencing
// this deliberately moves ahead of).
//
// Known gaps, called out rather than faked:
// - Search does plain text/city matching (api/listing.service.ts), not the
//   AI relevance-ranking "matching engine" from Section 9 — that isn't
//   built yet, so there's no per-listing match-score badge here.
// - "Verified Listing" only renders when the listing's agent actually has
//   verificationStatus "verified" — true for nobody yet, since there's no
//   verification flow built. Never fabricated.
// - Filter buttons (Location/Price Range/etc.), Save Search, Get Alerts,
//   and the card's Details/Contact Agent buttons are inert placeholders —
//   their destinations (property detail page, saved searches, lead
//   capture) don't exist yet.
export default function HomePage() {
  const [query, setQuery] = useState('');
  const [listings, setListings] = useState<PublicProperty[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchListings(q?: string) {
    setError(null);
    try {
      const res = await api.searchListings(q ? { q } : {});
      setListings(res.listings);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not load listings right now.');
      setListings([]);
    }
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    fetchListings(query.trim() || undefined);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container-app flex flex-grow flex-col gap-stack-lg py-stack-lg">
        {/* Hero search */}
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center py-12 text-center md:py-20">
          <h1 className="mb-4 text-headline-lg-mobile font-semibold text-trust-blue-900 md:text-headline-xl md:font-bold">
            Find Your Perfect Property with AI
          </h1>
          <p className="body-lg mb-10 max-w-2xl text-on-surface-variant">
            Tell us exactly what you&apos;re looking for, and our AI will match you with agents
            and agencies ready to help — starting in Nigeria, expanding worldwide.
          </p>
          <form onSubmit={handleSearch} className="ai-hero-search w-full">
            <div className="ai-hero-search-inner">
              <span className="material-symbols-outlined ml-4 text-growth-emerald-500">
                auto_awesome
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="e.g., 3-bedroom apartment in Lekki, ₦5M - ₦8M, with a pool and 24/7 power"
                className="body-lg w-full border-none bg-transparent py-4 pl-4 pr-32 text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0"
              />
              <button type="submit" className="btn-primary absolute right-4 gap-2">
                Search
                <span className="material-symbols-outlined text-[18px]">search</span>
              </button>
            </div>
          </form>
        </section>

        {/* Filters — visual only for now; wiring these to real query params
            is a follow-up once the results below need to be narrowed. */}
        <section className="flex w-full flex-col items-center justify-between gap-4 border-b border-border-gray-200 pb-stack-md md:flex-row">
          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            {['Location', 'Price Range', 'Property Type'].map((label) => (
              <button
                key={label}
                type="button"
                className="label-md flex items-center gap-2 rounded border border-border-gray-200 bg-surface-container-lowest px-4 py-2 text-on-surface transition-colors hover:border-trust-blue-900"
              >
                {label}
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            ))}
            <button
              type="button"
              className="label-md flex items-center gap-2 rounded border border-border-gray-200 bg-surface-container-lowest px-4 py-2 text-on-surface transition-colors hover:border-trust-blue-900"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              More Filters
            </button>
          </div>
          <div className="flex w-full justify-end gap-3 md:w-auto">
            <button type="button" className="label-md flex items-center gap-2 text-trust-blue-900">
              <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
              Save Search
            </button>
            <button
              type="button"
              className="label-md flex items-center gap-2 text-growth-emerald-500"
            >
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              Get Alerts
            </button>
          </div>
        </section>

        {/* Results */}
        <section className="w-full">
          <h2 className="headline-md mb-6 text-on-surface">Top Matches for You</h2>

          {listings === null && <p className="body-md text-on-surface-variant">Loading…</p>}
          {error && <p className="body-md text-error">{error}</p>}

          {listings && listings.length === 0 && <EmptyResults />}

          {listings && listings.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <PropertyCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </section>

        {/* Supply-side CTA — always shown (not the zero-results fallback,
            which stays neutral per Section 6: a genuine seeker hitting
            "become an agent" on an empty search is a dead end). Explicitly
            global now, not Nigeria-only. */}
        <section className="mt-8 flex w-full flex-col items-center justify-between gap-6 rounded-xl bg-surface-container p-8 md:flex-row">
          <div>
            <h3 className="headline-md mb-2 text-trust-blue-900">
              Can&apos;t find exactly what you need?
            </h3>
            <p className="body-md text-on-surface-variant">
              Our inventory is growing daily. Save your search to get notified — or if
              you&apos;re an agent or agency anywhere in the world, start listing properties
              today.
            </p>
          </div>
          <div className="flex w-full gap-4 md:w-auto">
            <Link
              href="/register"
              className="w-full rounded border border-trust-blue-900 bg-surface-container-lowest px-6 py-3 text-center text-label-md font-medium text-trust-blue-900 transition-colors hover:bg-surface-container-high md:w-auto"
            >
              Become an Agent
            </Link>
            <Link href="/register" className="btn-primary w-full md:w-auto">
              List Property
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="elevation-1 rounded-lg p-10 text-center">
      <p className="body-md text-on-surface-variant">
        No properties match yet — our listing base is growing city by city. Check back soon, or
        broaden your search.
      </p>
    </div>
  );
}

function PropertyCard({ listing }: { listing: PublicProperty }) {
  const photo = listing.media[0];
  const specs: string[] = [];
  if (listing.specifications.bedrooms != null) specs.push(`${listing.specifications.bedrooms} Beds`);
  if (listing.specifications.bathrooms != null) specs.push(`${listing.specifications.bathrooms} Baths`);
  if (listing.specifications.sizeSqm != null) specs.push(`${listing.specifications.sizeSqm} sqm`);

  return (
    <article className="card-property group flex flex-col">
      <div className="relative aspect-video w-full bg-surface-container">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- listing photos are agent-uploaded, not from a domain configured for next/image yet
          <img src={photo} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">image</span>
          </div>
        )}
        {listing.agentVerified && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-growth-emerald-500 bg-surface-container-lowest/90 px-3 py-1 backdrop-blur-sm">
            <span className="material-symbols-outlined text-[16px] text-growth-emerald-500">
              verified
            </span>
            <span className="label-sm text-trust-blue-900">Verified Listing</span>
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col p-5">
        <h3 className="mb-2 text-[20px] font-bold text-trust-blue-900">
          {listing.price.currency} {listing.price.amount.toLocaleString()}{' '}
          <span className="label-sm font-normal text-on-surface-variant">
            / {listing.price.period.replace('_', ' ')}
          </span>
        </h3>
        <p className="label-md mb-1 font-semibold text-on-surface">{listing.title}</p>
        <p className="label-sm mb-4 flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          {listing.location.city}
          {listing.location.district ? `, ${listing.location.district}` : ''}
        </p>

        {specs.length > 0 && (
          <div className="label-sm mb-5 flex flex-wrap items-center gap-4 border-t border-border-gray-200 pt-3 text-on-surface-variant">
            {specs.map((spec) => (
              <span key={spec}>{spec}</span>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2">
          <button
            type="button"
            className="flex-1 rounded border border-border-gray-200 bg-surface-gray-50 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
          >
            Details
          </button>
          <button type="button" className="btn-secondary flex-1">
            Contact Agent
          </button>
        </div>
      </div>
    </article>
  );
}
