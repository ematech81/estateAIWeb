'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'agent' | 'agency' | 'owner'>('agent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
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
      });
      setToken(token);
      router.push('/agent/dashboard');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Become a Nigerian Property Agent</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          I am a...
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="rounded-md border border-slate-300 px-3 py-2"
          >
            <option value="agent">Individual Agent</option>
            <option value="agency">Agency</option>
            <option value="owner">Property Owner</option>
          </select>
        </label>
        <Field label="Full name" value={name} onChange={setName} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required minLength={8} />
        <Field label="Phone (optional)" value={phone} onChange={setPhone} />
        {role !== 'agent' && (
          <Field label="Business / Agency name (optional)" value={businessName} onChange={setBusinessName} />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        minLength={minLength}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 font-normal"
      />
    </label>
  );
}
