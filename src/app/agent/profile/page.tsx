'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AgentLayout } from '@/components/layout/AgentLayout';
import { PageLoader } from '@/components/ui/PageLoader';
import { LoadingButton } from '@/components/ui/LoadingButton';
import type { UserProfile } from '@/lib/api';

export default function AgentProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, setUser: setContextUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [primaryLocation, setPrimaryLocation] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    api
      .getMe()
      .then((res) => {
        setProfile(res.user);
        setName(res.user.name);
        setPhone(res.user.phone ?? '');
        setBusinessName(res.user.businessName ?? '');
        setPrimaryLocation(res.user.primaryLocation ?? '');
      })
      .catch(() => setLoadError('Could not load your profile. Please try logging in again.'));
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const res = await api.updateProfile({
        name,
        phone: phone || undefined,
        businessName: businessName || undefined,
        primaryLocation: primaryLocation || undefined,
      });
      setProfile(res.user);
      // Keeps AuthContext's copy (and anything reading it, e.g. AgentSidebar's
      // name/verification display) in sync with what was just saved, without
      // a redundant re-fetch.
      setContextUser(res.user);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not save your profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AgentLayout>
      <div className="container-app max-w-xl py-12">
        <h1 className="headline-md mb-stack-lg text-on-surface">Profile</h1>

        {loadError && <p className="body-md text-error">{loadError}</p>}
        {!profile && !loadError && <PageLoader label="Loading your profile…" />}

        {profile && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
            <div className="elevation-1 flex items-center justify-between rounded-lg p-4">
              <div>
                <p className="label-sm text-on-surface-variant">Email</p>
                <p className="body-md text-on-surface">{profile.email}</p>
              </div>
              <VerificationBadge status={profile.verificationStatus} />
            </div>

            <Field label="Full name" value={name} onChange={setName} required />
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field
              label="Agency / Business name"
              value={businessName}
              onChange={setBusinessName}
            />
            <Field label="Primary location" value={primaryLocation} onChange={setPrimaryLocation} />

            {error && <p className="body-md text-error">{error}</p>}
            {saved && <p className="body-md text-secondary">Profile updated.</p>}

            <LoadingButton type="submit" loading={submitting} loadingText="Saving…" variant="primary" className="mt-1">
              Save changes
            </LoadingButton>
          </form>
        )}
      </div>
    </AgentLayout>
  );
}

function VerificationBadge({ status }: { status: UserProfile['verificationStatus'] }) {
  const classNames: Record<UserProfile['verificationStatus'], string> = {
    verified: 'badge-verified',
    pending: 'badge-pending',
    unverified: 'badge-pending',
  };
  return <span className={classNames[status]}>{status}</span>;
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="label-md flex flex-col gap-1 text-on-surface-variant">
      {label}
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="input-standard"
      />
    </label>
  );
}
