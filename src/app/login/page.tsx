'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiClientError } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token } = await api.login({ email, password });
      setToken(token);
      router.push('/agent/dashboard');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-surface-gray-50">
      <div className="container-app max-w-md py-12">
        <h1 className="headline-md mb-stack-md text-on-surface">Log in</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <label className="label-md flex flex-col gap-1 text-on-surface-variant">
            Email
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="input-standard"
            />
          </label>
          <label className="label-md flex flex-col gap-1 text-on-surface-variant">
            Password
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="input-standard"
            />
          </label>
          {error && <p className="body-md text-error">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary mt-stack-sm">
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="body-md mt-stack-md text-on-surface-variant">
          No account yet?{' '}
          <Link href="/register" className="font-medium text-on-surface underline">
            Become an agent
          </Link>
        </p>
      </div>
    </main>
  );
}
