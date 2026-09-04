'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, ApiClientError } from '@/lib/api';
import { AgentLayout } from '@/components/layout/AgentLayout';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { PageLoader } from '@/components/ui/PageLoader';

// Mirrors api/src/config/plans.ts by hand — same convention as
// types/property.ts (no shared-types package yet, not needed at this
// size). Display-only; the backend's config is the actual source of truth
// for what gets enforced/priced.
type PlanTier = 'free' | 'basic' | 'premium';
const PLAN_DISPLAY: Record<PlanTier, { name: string; price: string; period: string; features: string[] }> = {
  free: {
    name: 'Free',
    // "NGN", not the ₦ symbol — matches every other price display in the
    // app (PropertyCard, dashboard, ...). The raw glyph renders with a
    // visible font glitch (looks like a strikethrough) at this size/weight
    // in the font this app uses, which is exactly why the rest of the app
    // already avoids it.
    price: 'NGN 0',
    period: 'forever',
    features: ['2 listings per month'],
  },
  basic: {
    name: 'Basic',
    price: 'NGN 5,000',
    period: 'one-time, active 2 weeks',
    features: ['10 listings per month', 'Priority placement in search results'],
  },
  premium: {
    name: 'Premium',
    price: 'NGN 15,000',
    period: 'one-time, active 30 days',
    features: [
      'Unlimited listings',
      'Priority placement in search results',
      'New-listing emails to subscribed users',
      'Listings appear in Google search results',
    ],
  },
};

export default function UpgradePage() {
  return (
    <Suspense fallback={<PageLoader label="Loading…" />}>
      <UpgradeContent />
    </Suspense>
  );
}

function UpgradeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user, setUser } = useAuth();
  const [checkingOut, setCheckingOut] = useState<PlanTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const justReturnedFromCheckout = Boolean(searchParams.get('reference'));

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  // The webhook that actually activates the plan is server-to-server and
  // can take a few seconds to arrive after KoraPay redirects the agent
  // back here — one re-fetch of the profile a couple of seconds later is
  // enough to pick it up without building out full polling.
  useEffect(() => {
    if (!justReturnedFromCheckout) return;
    const t = setTimeout(() => {
      api.getMe().then((res) => setUser(res.user)).catch(() => {});
    }, 3000);
    return () => clearTimeout(t);
  }, [justReturnedFromCheckout, setUser]);

  async function handleSubscribe(plan: 'basic' | 'premium') {
    setError(null);
    setCheckingOut(plan);
    try {
      const { checkoutUrl } = await api.initiateCheckout(plan);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not start checkout. Please try again.');
      setCheckingOut(null);
    }
  }

  const currentTier = (user?.planTier ?? 'free') as PlanTier;

  return (
    <AgentLayout>
      <div className="mx-auto max-w-container-max space-y-stack-lg px-margin-mobile py-stack-lg md:px-gutter">
        <div>
          <h1 className="headline-lg-mobile md:headline-lg font-bold text-primary">Upgrade Your Plan</h1>
          <p className="body-md mt-1 text-on-surface-variant">
            More listings, priority placement, and reach — pick what fits.
          </p>
        </div>

        {justReturnedFromCheckout && (
          <div className="rounded-lg border border-tertiary-container bg-tertiary-container/10 p-4">
            <p className="body-md text-on-surface">
              Confirming your payment — this usually takes a few seconds. Your plan below will update
              automatically once it&apos;s through.
            </p>
          </div>
        )}

        {user && (
          <p className="body-md text-on-surface-variant">
            Your current plan: <span className="font-semibold text-trust-blue-900">{PLAN_DISPLAY[currentTier].name}</span>
            {user.planExpiresAt && (
              <> — active until {new Date(user.planExpiresAt).toLocaleDateString()}</>
            )}
          </p>
        )}

        {error && <p className="body-md text-error">{error}</p>}

        <div className="grid grid-cols-1 gap-stack-md md:grid-cols-3">
          {(Object.keys(PLAN_DISPLAY) as PlanTier[]).map((tier) => {
            const plan = PLAN_DISPLAY[tier];
            const isCurrent = currentTier === tier;
            const isPremium = tier === 'premium';
            return (
              <div
                key={tier}
                className={
                  isPremium
                    ? 'flex flex-col gap-stack-md rounded-xl border-2 border-trust-blue-900 bg-surface-container-lowest p-stack-lg shadow-md'
                    : 'flex flex-col gap-stack-md rounded-xl border border-border-gray-200 bg-surface-container-lowest p-stack-lg shadow-sm'
                }
              >
                <div>
                  <h2 className="headline-md font-bold text-primary">{plan.name}</h2>
                  <p className="mt-1">
                    <span className="headline-lg font-bold text-trust-blue-900">{plan.price}</span>
                  </p>
                  <p className="label-sm text-on-surface-variant">{plan.period}</p>
                </div>

                <ul className="flex flex-1 flex-col gap-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="body-md flex items-start gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined mt-0.5 text-[18px] text-growth-emerald-500">
                        check_circle
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {tier === 'free' ? (
                  <span className="label-md rounded border border-border-gray-200 px-4 py-2 text-center text-on-surface-variant">
                    {isCurrent ? 'Current Plan' : 'Default plan'}
                  </span>
                ) : isCurrent ? (
                  <span className="btn-tertiary pointer-events-none justify-center">Current Plan</span>
                ) : (
                  <LoadingButton
                    onClick={() => handleSubscribe(tier as 'basic' | 'premium')}
                    loading={checkingOut === tier}
                    loadingText="Redirecting…"
                    variant={isPremium ? 'primary' : 'secondary'}
                  >
                    Subscribe
                  </LoadingButton>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AgentLayout>
  );
}
