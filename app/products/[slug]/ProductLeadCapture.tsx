'use client';

import { useState } from 'react';

type Props = {
  productName: string;
  slug: string;
};

export default function ProductLeadCapture({ productName, slug }: Props) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending' || status === 'done') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/product-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), product: productName, slug, website }),
      });
      if (res.ok) {
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4">
        <p className="text-sm font-bold text-green-900">You&apos;re in!</p>
        <p className="mt-1 text-xs leading-relaxed text-green-900/70">
          We&apos;ll email you the current discount code shortly. Check your inbox (and spam folder) soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4">
      <p className="text-sm font-bold text-green-900">Still deciding?</p>
      <p className="mt-1 text-xs leading-relaxed text-green-900/70">
        Leave your email — we&apos;ll send you the current discount code and answer any questions.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          maxLength={200}
          aria-label="Email address"
          className="min-w-0 flex-1 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none"
        />
        {/* Honeypot: invisible to humans, bots fill it and get silently dropped */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          placeholder="Leave this field empty"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn-primary whitespace-nowrap rounded-lg px-4 py-2 text-sm disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Get the Code'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-600">Something went wrong — please try again.</p>
      )}
      <p className="mt-2 text-[11px] text-green-900/50">No spam — just the code and answers.</p>
    </div>
  );
}
