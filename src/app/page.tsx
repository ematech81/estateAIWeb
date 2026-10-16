'use client';

import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/PageLoader';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Pagination } from '@/components/ui/Pagination';
import { PropertyCard } from '@/components/property/PropertyCard';
import { api, ApiClientError } from '@/lib/api';
import type { PropertyType, PublicProperty } from '@/types/property';

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
// - Save Search and Get Alerts are still inert placeholders — no persisted
//   saved-search model or notification delivery mechanism exists yet.
// - Price Range/min/max filtering is not currency-aware — it filters the
//   raw price.amount regardless of currency, which only makes sense given
//   how differently-scaled NGN and USD listings are. A future improvement,
//   not hidden.
// - There's no external data source anymore (a RentCast integration was
//   built and then deliberately removed) — "international" now just means
//   a real registered agent listed a real property outside Nigeria through
//   this same flow, filtered on location.country.
const PAGE_SIZE = 12;
const PROPERTY_TYPES: PropertyType[] = [
  'apartment',
  'duplex',
  'bungalow',
  'terrace',
  'detached_house',
  'semi_detached_house',
  'land',
  'commercial',
  'other',
];

interface SearchOverrides {
  page?: number;
  q?: string;
  international?: boolean;
  city?: string;
  propertyType?: PropertyType | '';
  minPrice?: string;
  maxPrice?: string;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  // Pill toggle, not a three-way filter — off means "show everything"
  // (no param sent), not "local only".
  const [international, setInternational] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | ''>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [listings, setListings] = useState<PublicProperty[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Separate from `listings === null` (the very first load): tracks a
  // re-search too, so hitting "Search" again with existing results still
  // shows feedback instead of the page appearing to do nothing.
  const [searching, setSearching] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Accepts overrides rather than only reading state, so a click handler
  // (e.g. switching tabs) can search with the new value immediately instead
  // of racing the next render — React state updates aren't visible in the
  // same synchronous callback that set them.
  async function fetchListings(overrides: SearchOverrides = {}) {
    const params = {
      q: overrides.q ?? query,
      international: overrides.international ?? international,
      city: overrides.city ?? cityFilter,
      propertyType: overrides.propertyType ?? propertyTypeFilter,
      minPrice: overrides.minPrice ?? minPrice,
      maxPrice: overrides.maxPrice ?? maxPrice,
      page: overrides.page ?? 1,
    };

    setError(null);
    setSearching(true);
    try {
      const res = await api.searchListings({
        q: params.q.trim() || undefined,
        city: params.city.trim() || undefined,
        // Omitted (not `false`) when off, so it means "show everything"
        // rather than narrowing to local-only.
        international: params.international ? true : undefined,
        propertyType: params.propertyType || undefined,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        page: params.page,
        limit: PAGE_SIZE,
      });
      setListings(res.listings);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not load listings right now.');
      setListings([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setSearching(false);
    }

    // Keep state in sync with whatever was actually just searched, so the
    // UI (filter badges, pagination) reflects reality.
    setInternational(params.international);
    setCityFilter(params.city);
    setPropertyTypeFilter(params.propertyType);
    setMinPrice(params.minPrice);
    setMaxPrice(params.maxPrice);
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    fetchListings({ page: 1 });
  }

  function handlePageChange(nextPage: number) {
    fetchListings({ page: nextPage });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            Search listings from property owners, agents and agencies, then contact them
            directly — starting in Nigeria, expanding worldwide.
          </p>
          <form onSubmit={handleSearch} className="ai-hero-search w-full">
            <div className="ai-hero-search-inner !items-stretch">
              <span className="material-symbols-outlined absolute left-4 top-4 text-growth-emerald-500">
                auto_awesome
              </span>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  // Enter submits (matches a single-line search box's
                  // behavior); Shift+Enter still inserts a newline for
                  // anyone genuinely typing a multi-line description.
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    fetchListings({ page: 1 });
                  }
                }}
                placeholder="e.g., 3-bedroom apartment in Lekki, ₦5M - ₦8M, with a pool and 24/7 power"
                className="body-lg min-h-[150px] w-full resize-none border-none bg-transparent py-4 pl-11 pr-4 text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0"
              />
              <LoadingButton
                type="submit"
                loading={searching}
                loadingText="Searching…"
                variant="primary"
                className="absolute bottom-4 right-4 gap-2"
              >
                Search
                <span className="material-symbols-outlined text-[18px]">search</span>
              </LoadingButton>
            </div>
          </form>
        </section>

        {/* Filters */}
        <section className="flex w-full flex-col items-center justify-between gap-4 border-b border-border-gray-200 pb-stack-md md:flex-row">
          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            <FilterDropdown label="Location" active={!!cityFilter} activeLabel={cityFilter}>
              {(close) => (
                <ApplyFilterPanel
                  initialValue={cityFilter}
                  placeholder="e.g. Lekki, Austin…"
                  onApply={(value) => {
                    fetchListings({ city: value, page: 1 });
                    close();
                  }}
                />
              )}
            </FilterDropdown>

            <FilterDropdown
              label="Price Range"
              active={!!(minPrice || maxPrice)}
              activeLabel={
                minPrice || maxPrice
                  ? `${minPrice || '0'} – ${maxPrice || '∞'}`
                  : undefined
              }
            >
              {(close) => (
                <PriceRangePanel
                  initialMin={minPrice}
                  initialMax={maxPrice}
                  onApply={(min, max) => {
                    fetchListings({ minPrice: min, maxPrice: max, page: 1 });
                    close();
                  }}
                />
              )}
            </FilterDropdown>

            <select
              value={propertyTypeFilter}
              onChange={(e) => fetchListings({ propertyType: e.target.value as PropertyType | '', page: 1 })}
              className={
                propertyTypeFilter
                  ? 'label-md rounded border border-trust-blue-900 bg-surface-container-low px-4 py-2 text-trust-blue-900'
                  : 'label-md rounded border border-border-gray-200 bg-surface-container-lowest px-4 py-2 text-on-surface'
              }
            >
              <option value="">Property Type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => fetchListings({ international: !international, page: 1 })}
              className={
                international
                  ? 'label-md flex items-center gap-2 rounded border border-trust-blue-900 bg-surface-container-low px-4 py-2 text-trust-blue-900'
                  : 'label-md flex items-center gap-2 rounded border border-border-gray-200 bg-surface-container-lowest px-4 py-2 text-on-surface transition-colors hover:border-trust-blue-900'
              }
            >
              <span className="material-symbols-outlined text-[18px]">public</span>
              International
            </button>
          </div>
          <div className="flex w-full justify-end gap-3 md:w-auto">
            <button
              type="button"
              title="Save Search — coming soon"
              className="label-md flex cursor-default items-center gap-2 text-trust-blue-900/50"
            >
              <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
              Save Search
            </button>
            <button
              type="button"
              title="Get Alerts — coming soon"
              className="label-md flex cursor-default items-center gap-2 text-growth-emerald-500/50"
            >
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              Get Alerts
            </button>
          </div>
        </section>

        {/* Results */}
        <section ref={resultsRef} className="w-full scroll-mt-24">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="headline-md text-on-surface">Top Matches for You</h2>
            {!searching && total > 0 && (
              <span className="label-md text-on-surface-variant">{total.toLocaleString()} properties</span>
            )}
          </div>

          {(listings === null || searching) && <PageLoader label="Loading properties…" />}
          {error && !searching && <p className="body-md text-error">{error}</p>}

          {!searching && listings && listings.length === 0 && <EmptyResults />}

          {!searching && listings && listings.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <PropertyCard key={listing._id} listing={listing} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
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

// Small popover filter — click the button to reveal `children`, which
// receives a `close` callback to call once its own "Apply" fires.
function FilterDropdown({
  label,
  active,
  activeLabel,
  children,
}: {
  label: string;
  active: boolean;
  activeLabel?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          active
            ? 'label-md flex items-center gap-2 rounded border border-trust-blue-900 bg-surface-container-low px-4 py-2 text-trust-blue-900'
            : 'label-md flex items-center gap-2 rounded border border-border-gray-200 bg-surface-container-lowest px-4 py-2 text-on-surface transition-colors hover:border-trust-blue-900'
        }
      >
        {active && activeLabel ? `${label}: ${activeLabel}` : label}
        <span className="material-symbols-outlined text-[18px]">expand_more</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-border-gray-200 bg-surface-container-lowest p-4 shadow-lg">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function ApplyFilterPanel({
  initialValue,
  placeholder,
  onApply,
}: {
  initialValue: string;
  placeholder: string;
  onApply: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="flex flex-col gap-stack-sm">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-standard"
        autoFocus
      />
      <button type="button" onClick={() => onApply(value)} className="btn-primary !py-2">
        Apply
      </button>
    </div>
  );
}

function PriceRangePanel({
  initialMin,
  initialMax,
  onApply,
}: {
  initialMin: string;
  initialMax: string;
  onApply: (min: string, max: string) => void;
}) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  return (
    <div className="flex flex-col gap-stack-sm">
      <input
        type="number"
        min={0}
        value={min}
        onChange={(e) => setMin(e.target.value)}
        placeholder="Min"
        className="input-standard"
        autoFocus
      />
      <input
        type="number"
        min={0}
        value={max}
        onChange={(e) => setMax(e.target.value)}
        placeholder="Max"
        className="input-standard"
      />
      <button type="button" onClick={() => onApply(min, max)} className="btn-primary !py-2">
        Apply
      </button>
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

