'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PartnerLanding() {
  const params = useParams();
  const raw = (params?.partner as string) || 'partner';
  const partner = raw.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24) || 'PARTNER';
  const code = `FL-${partner}10`;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'affiliate_landing_view', {
        partner,
        coupon: code,
        page_path: `/go/${raw}`,
      });
    }
  }, [partner, code, raw]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'affiliate_code_copy', { partner, coupon: code });
      }
    } catch {
      /* clipboard unavailable */
    }
  };

  const buyUrl = `/products/freshlock-pro?coupon=${code}&src=${partner.toLowerCase()}`;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-10 text-center">
        <p className="text-sm font-semibold tracking-widest text-orange-600 uppercase mb-3">
          {partner} exclusive
        </p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          FreshLock Pro &mdash; for people who hate throwing food away
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          The handheld vacuum sealer that turns mason jars into fresh-keeping machines.
          Berries last 2&ndash;3 weeks. Cheese stops drying out. Coffee stays fresh past a month.
        </p>

        <div className="inline-flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-6 py-4 mb-6">
          <div className="text-left">
            <p className="text-sm text-gray-500 line-through">$74.99</p>
            <p className="text-3xl font-bold text-orange-600">$69.99</p>
          </div>
          <button
            onClick={copyCode}
            className="ml-2 px-4 py-2 rounded-xl bg-gray-900 text-white font-mono text-sm hover:bg-gray-700"
            aria-label="Copy discount code"
          >
            {copied ? 'Copied!' : code}
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Tap the code to copy &mdash; enter it at checkout.</p>

        <Link
          href={buyUrl}
          onClick={() => {
            if (typeof (window as any).gtag === 'function') {
              (window as any).gtag('event', 'affiliate_cta_click', { partner, coupon: code });
            }
          }}
          className="inline-block px-10 py-4 rounded-2xl bg-orange-600 text-white text-lg font-semibold hover:bg-orange-700"
        >
          Get FreshLock Pro &mdash; $69.99
        </Link>
        <p className="text-xs text-gray-400 mt-3">30-day returns &middot; PayPal secure checkout</p>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <h2 className="text-xl font-bold mb-4">Why this one</h2>
        <ul className="space-y-3 text-gray-700">
          <li>&bull; <strong>Jar hose included</strong> &mdash; wide and regular mouth, in the box. Most brands charge extra.</li>
          <li>&bull; <strong>Bags and jars</strong> &mdash; one-touch sealing for both, no proprietary bag lock-in.</li>
          <li>&bull; <strong>30-day returns</strong> plus a 1-year warranty, backed by PayPal.</li>
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-10">
        <h2 className="text-xl font-bold mb-4">What owners use it for</h2>
        <ul className="space-y-3 text-gray-700">
          <li>&bull; Sunday meal prep that still tastes like Sunday on Thursday</li>
          <li>&bull; Sourdough discard, frozen flat and ready for crackers</li>
          <li>&bull; Camping dry goods &mdash; crackers stay crisp in any weather</li>
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-16">
        <h2 className="text-xl font-bold mb-4">FAQ</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <p className="font-semibold">How is it different from FoodSaver?</p>
            <p>At this price, it&apos;s the only handheld that includes the complete mason-jar hose kit. Open bag ecosystem, too &mdash; any one-way valve bag works.</p>
          </div>
          <div>
            <p className="font-semibold">What if I don&apos;t like it?</p>
            <p>30-day no-questions returns. Plus 20+ tutorials on the site if you want to get the most out of it first.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
