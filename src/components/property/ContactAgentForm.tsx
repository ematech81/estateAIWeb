'use client';

import { FormEvent, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { LoadingButton } from '@/components/ui/LoadingButton';

export function ContactAgentForm({ propertyId }: { propertyId: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.submitLead(propertyId, { name, email, phone: phone || undefined, message: message || undefined });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="elevation-1 rounded-xl p-stack-lg text-center">
        <span className="material-symbols-outlined text-[32px] text-growth-emerald-500">check_circle</span>
        <p className="body-md mt-2 text-on-surface">
          Your message has been sent. The agent will get back to you directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="elevation-1 flex flex-col gap-stack-sm rounded-xl p-stack-lg">
      <h2 className="headline-md text-on-surface">Contact Agent</h2>
      <p className="body-md mb-1 text-on-surface-variant">
        Interested in this property? Send a message and the agent will reach out.
      </p>

      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required className="input-standard" />
      </label>
      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-standard"
        />
      </label>
      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Phone (optional)
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-standard" />
      </label>
      <label className="label-md flex flex-col gap-1 text-on-surface-variant">
        Message (optional)
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="input-standard" />
      </label>

      {error && <p className="body-md text-error">{error}</p>}

      <LoadingButton type="submit" loading={submitting} loadingText="Sending…" variant="secondary" className="mt-1">
        Send Message
      </LoadingButton>
    </form>
  );
}
