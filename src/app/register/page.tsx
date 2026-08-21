'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { LoadingButton } from '@/components/ui/LoadingButton';

type Role = 'agent' | 'agency' | 'owner';
const ROLES: { value: Role; label: string }[] = [
  { value: 'agent', label: 'Agent' },
  { value: 'agency', label: 'Agency' },
  { value: 'owner', label: 'Owner' },
];

// Card heading and submit button both track the selected role, so "Register
// Agency" doesn't show up while "Owner" is selected.
const REGISTER_COPY: Record<Role, { heading: string; button: string }> = {
  agent: { heading: 'Agent Registration', button: 'Register as Agent' },
  agency: { heading: 'Agency Registration', button: 'Register Agency' },
  owner: { heading: 'Owner Registration', button: 'Register as Owner' },
};

// Landing-page hero for the Phase 1 supply-side push (Section 5 of the
// master build prompt) — deliberately chrome-less (no site header/footer),
// matching the source design's intent: an ad-landing conversion page, not a
// regular app screen.
export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.push('/agent/dashboard');
  }, [isLoading, isAuthenticated, router]);

  const [role, setRole] = useState<Role>('agent');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [primaryLocation, setPrimaryLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token } = await api.register({
        email,
        password,
        name,
        role,
        phone: phone || undefined,
        businessName: businessName || undefined,
        primaryLocation: primaryLocation || undefined,
      });
      login(token);
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-surface-gray-50">
      <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-trust-blue-900 px-margin-mobile py-stack-lg pt-24 text-on-primary md:px-gutter">
        {/* Real hero photo — served from public/images/, not Cloudinary (it's
            a static brand asset, not agent-uploaded content). The dark
            gradient on top is still needed even over a photo: it's what
            keeps the white heading text legible regardless of what's
            underneath. */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-skyline-night.jpg')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-trust-blue-900/90 via-trust-blue-900/60 to-black/80" />
        <div className="absolute -right-24 -top-24 z-0 h-96 w-96 rounded-full bg-growth-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 z-0 h-96 w-96 rounded-full bg-premium-gold/5 blur-3xl" />

        <Link
          href="/"
          className="absolute left-margin-mobile top-8 z-10 flex items-center gap-2 text-on-primary md:left-gutter"
        >
          <span className="material-symbols-outlined text-growth-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>
            real_estate_agent
          </span>
          <span className="headline-md">EstateAI</span>
        </Link>

        <div className="relative z-10 mx-auto grid w-full max-w-container-max grid-cols-1 items-center gap-stack-lg lg:grid-cols-2">
          {/* Hero copy */}
          <div className="flex max-w-xl flex-col gap-stack-md">
            <h1 className="headline-xl text-on-primary">
              List Your Property Where Global Buyers Are Already Searching
            </h1>
            <p className="body-lg text-inverse-primary">
              Join the growing network of real estate agents, agencies, and property owners — Nigerian and
              international — putting listings in front of buyers with AI-assisted tools built for how people
              actually search.
            </p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
                <span className="material-symbols-outlined text-growth-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span className="label-md text-on-primary">AI-Assisted Listing</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
                <span className="material-symbols-outlined text-premium-gold" style={{ fontVariationSettings: "'FILL' 1" }}>
                  public
                </span>
                <span className="label-md text-on-primary">Global Exposure</span>
              </div>
            </div>
          </div>

          {/* Registration card */}
          <div className="relative flex w-full max-w-md flex-col gap-stack-sm overflow-hidden rounded-xl bg-white p-stack-lg shadow-[0_12px_40px_-10px_rgba(0,0,0,0.2)] lg:ml-auto">
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-secondary-fixed/20 blur-3xl" />

            <div className="relative z-10 mb-2">
              <h2 className="headline-md font-bold text-on-surface">{REGISTER_COPY[role].heading}</h2>
              <p className="body-md mt-1 text-on-surface-variant">Start connecting with global buyers today.</p>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4">
              {/* Role selector — not in the source design, but required:
                  the backend needs agent | agency | owner, and Phase 1
                  explicitly targets individual owners too, not just agencies
                  (master build prompt, Section 4.3). */}
              <div className="flex flex-col gap-1">
                <span className="label-sm text-on-surface-variant">I am registering as a...</span>
                <div className="flex gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={
                        role === r.value
                          ? 'btn-primary flex-1 !py-2 text-label-sm'
                          : 'btn-tertiary flex-1 !py-2 text-label-sm'
                      }
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Full Name" placeholder="John Doe" value={name} onChange={setName} required />

              <Field
                label={role === 'agency' ? 'Agency Name' : 'Agency / Business Name (optional)'}
                placeholder="Prime Realty Ltd."
                value={businessName}
                onChange={setBusinessName}
                required={role === 'agency'}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Phone Number"
                  type="tel"
                  placeholder="+234..."
                  value={phone}
                  onChange={setPhone}
                  required
                />
                <Field
                  label="Email Address"
                  type="email"
                  placeholder="agent@agency.com"
                  value={email}
                  onChange={setEmail}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="label-sm text-on-surface-variant">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="input-standard rounded-lg bg-surface-gray-50 px-4 py-3 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="location" className="label-sm text-on-surface-variant">
                  Primary Location
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    location_on
                  </span>
                  <input
                    id="location"
                    type="text"
                    value={primaryLocation}
                    onChange={(e) => setPrimaryLocation(e.target.value)}
                    placeholder="e.g. Ikoyi, Lagos"
                    className="input-standard rounded-lg bg-surface-gray-50 py-3 pl-10 pr-4"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="body-md text-error">
                  {error}
                </p>
              )}

              <LoadingButton
                type="submit"
                loading={submitting}
                loadingText="Registering…"
                variant="primary"
                className="mt-4 w-full py-3"
              >
                {REGISTER_COPY[role].button}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </LoadingButton>

              <p className="label-md text-center text-on-surface-variant">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-trust-blue-900 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label-sm text-on-surface-variant">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="input-standard rounded-lg bg-surface-gray-50 px-4 py-3"
      />
    </label>
  );
}
