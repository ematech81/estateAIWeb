import Link from 'next/link';

// Phase 1 landing copy per Section 5 of the master build prompt: this leads
// with the supply-side pitch ("list where global buyers are already
// searching"), not a consumer search hero — that's Phase 2, gated on real
// Nigerian listing density existing.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        List your property where global buyers are already searching.
      </h1>
      <p className="max-w-xl text-lg text-slate-600">
        Describe your property in your own words — our AI structures it into a professional
        listing for you to review and publish in minutes.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="rounded-md bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-700"
        >
          Become a Nigerian Property Agent
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-slate-300 px-6 py-3 font-medium text-slate-900 hover:bg-slate-100"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
