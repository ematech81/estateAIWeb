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
    <main className="flex min-h-screen flex-col justify-center bg-surface-gray-50">
      <div className="container-app max-w-md py-12">
        <h1 className="headline-md mb-stack-md text-on-surface">
          Become a Nigerian Property Agent
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <label className="label-md flex flex-col gap-1 text-on-surface-variant">
            I am a...
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="input-standard"
            >
              <option value="agent">Individual Agent</option>
              <option value="agency">Agency</option>
              <option value="owner">Property Owner</option>
            </select>
          </label>
          <Field label="Full name" value={name} onChange={setName} required />
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
            minLength={8}
          />
          <Field label="Phone (optional)" value={phone} onChange={setPhone} />
          {role !== 'agent' && (
            <Field
              label="Business / Agency name (optional)"
              value={businessName}
              onChange={setBusinessName}
            />
          )}
          {error && <p className="body-md text-error">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary mt-stack-sm">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
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
    <label className="label-md flex flex-col gap-1 text-on-surface-variant">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        minLength={minLength}
        onChange={(e) => onChange(e.target.value)}
        className="input-standard"
      />
    </label>
  );
}
