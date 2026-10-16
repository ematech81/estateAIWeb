'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AgentLayout } from '@/components/layout/AgentLayout';
import { LoadingButton } from '@/components/ui/LoadingButton';

const DELETE_CONFIRM_PHRASE = 'delete my account';

export default function AgentSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  return (
    <AgentLayout>
      <div className="container-app max-w-xl py-12">
        <h1 className="headline-lg-mobile md:headline-lg mb-stack-lg text-trust-blue-900">Settings</h1>
        <div className="flex flex-col gap-stack-lg">
          <EmailPreferencesSection />
          <PasswordSection />
          <DangerZone
            onDeleted={() => {
              logout();
              router.push('/');
            }}
          />
        </div>
      </div>
    </AgentLayout>
  );
}

function EmailPreferencesSection() {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(checked: boolean) {
    setError(null);
    setSaving(true);
    try {
      const res = await api.updateProfile({ emailMarketingOptIn: checked });
      setUser(res.user);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not save your preference.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <section className="elevation-1 flex flex-col gap-stack-md rounded-lg p-6">
      <div>
        <h2 className="headline-md font-bold text-on-surface">Email preferences</h2>
        <p className="body-md mt-1 text-on-surface-variant">Control what EstateAI emails you about.</p>
      </div>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={user.emailMarketingOptIn}
          disabled={saving}
          onChange={(e) => handleToggle(e.target.checked)}
          className="mt-1 h-4 w-4 rounded-sm border-border-gray-200 text-trust-blue-900 focus:ring-trust-blue-900"
        />
        <span className="body-md text-on-surface">
          Email me when a new property is listed on EstateAI.
          <span className="label-sm mt-1 block text-on-surface-variant">
            Off by default. You can turn this off again at any time.
          </span>
        </span>
      </label>

      {error && <p className="body-md text-error">{error}</p>}
    </section>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setSaved(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not change your password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="elevation-1 flex flex-col gap-stack-md rounded-lg p-6">
      <div>
        <h2 className="headline-md font-bold text-on-surface">Change password</h2>
        <p className="body-md mt-1 text-on-surface-variant">
          You&apos;ll need your current password to set a new one.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
        <label className="label-md flex flex-col gap-1 text-on-surface-variant">
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="input-standard"
          />
        </label>
        <label className="label-md flex flex-col gap-1 text-on-surface-variant">
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="input-standard"
          />
        </label>

        {error && <p className="body-md text-error">{error}</p>}
        {saved && <p className="body-md text-secondary">Password updated.</p>}

        <LoadingButton type="submit" loading={submitting} loadingText="Updating…" variant="primary" className="self-start">
          Update password
        </LoadingButton>
      </form>
    </section>
  );
}

function DangerZone({ onDeleted }: { onDeleted: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      await api.deleteAccount();
      onDeleted();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not delete your account.');
      setDeleting(false);
    }
  }

  return (
    <section className="flex flex-col gap-stack-md rounded-lg border border-error/40 bg-error/5 p-6">
      <div>
        <h2 className="headline-md font-bold text-error">Delete account</h2>
        <p className="body-md mt-1 text-on-surface-variant">
          This permanently deletes your account, all of your listings, and your listing performance data. This
          cannot be undone.
        </p>
      </div>

      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="self-start rounded border border-error px-4 py-2 text-label-md text-error transition-colors hover:bg-error/10"
        >
          Delete my account
        </button>
      ) : (
        <div className="flex flex-col gap-stack-sm">
          <label className="label-md flex flex-col gap-1 text-on-surface-variant">
            Type &quot;{DELETE_CONFIRM_PHRASE}&quot; to confirm
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="input-standard"
              autoFocus
            />
          </label>

          {error && <p className="body-md text-error">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                setConfirmText('');
                setError(null);
              }}
              className="btn-tertiary"
            >
              Cancel
            </button>
            <LoadingButton
              onClick={handleDelete}
              disabled={confirmText !== DELETE_CONFIRM_PHRASE}
              loading={deleting}
              loadingText="Deleting…"
              variant="secondary"
              className="!border-error !text-error hover:!bg-error/10"
            >
              Permanently delete
            </LoadingButton>
          </div>
        </div>
      )}
    </section>
  );
}
