'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'How does the AI search work?',
    answer:
      'Type what you\'re looking for in your own words — e.g. "3-bedroom apartment in Lekki, ₦5M–₦8M, with a pool and 24/7 power". We match it against real listings by location, price, and property type. Hard constraints like price and bedroom count are always enforced by the system, never left to the AI to guess.',
  },
  {
    question: 'How do I list a property?',
    answer:
      'Register as an Agent, Agency, or Owner, then use the AI-assisted listing flow: describe the property in your own words and the AI structures it into a listing for you to review and confirm before it goes live — nothing is published without your confirmation. A fully manual entry form is also available if you\'d rather fill it in yourself.',
  },
  {
    question: 'What does the "Verified Listing" badge mean?',
    answer: 'It means the listing agent\'s identity/business was verified by us.',
  },
  {
    question: 'What does the "International" tag on a listing mean?',
    answer:
      'It\'s a real property outside Nigeria, listed by a real registered agent through the same flow as any other listing — not a separate data source. When listing, an agent can switch to "International Agent" mode so we don\'t default the country/currency to Nigeria/NGN.',
  },
  {
    question: 'Why can\'t I see an agent\'s phone number or email in the directory?',
    answer:
      'To protect agents from spam and scraping, the public agent directory only shows their name, business, and location. To reach an agent, use the "Contact Agent" form on one of their listings — your message goes directly to them.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'We only display data from listings agents and agencies submit through EstateAI — never scraped from other sites. See our Privacy Policy for details on what we collect and how it\'s used.',
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container-app flex-grow py-stack-lg">
        <div className="mx-auto max-w-2xl">
          <h1 className="headline-lg mb-2 text-trust-blue-900">Help Center</h1>
          <p className="body-md mb-stack-lg text-on-surface-variant">
            Answers to common questions. Can&apos;t find what you need? Reach us directly below.
          </p>

          <div className="flex flex-col gap-stack-sm">
            {FAQS.map((faq) => (
              <FaqItem key={faq.question} {...faq} />
            ))}
          </div>

          <div className="elevation-1 mt-stack-lg rounded-xl p-6 text-center">
            <h2 className="headline-md mb-2 text-on-surface">Still need help?</h2>
            <p className="body-md mb-stack-md text-on-surface-variant">
              Email us and we&apos;ll get back to you.
            </p>
            <a href="mailto:support@estateai.com" className="btn-primary inline-flex">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              support@estateai.com
            </a>
          </div>

          <p className="label-md mt-stack-md text-center text-on-surface-variant">
            Looking to list a property?{' '}
            <Link href="/register" className="font-semibold text-trust-blue-900 hover:underline">
              Register as an agent
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="elevation-1 rounded-lg">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="label-md flex w-full items-center justify-between gap-4 p-4 text-left text-on-surface"
      >
        {question}
        <span className="material-symbols-outlined shrink-0 text-[20px] text-on-surface-variant">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {open && <p className="body-md border-t border-border-gray-200 p-4 text-on-surface-variant">{answer}</p>}
    </div>
  );
}
