'use client';

import { useState } from 'react';

type Props = {
  items: Array<{ slug: string; quantity: number }>;
  shippingMethod: string;
  couponCode?: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
};

type Phase = 'idle' | 'preparing' | 'redirecting' | 'error';

export default function AirwallexPayment(props: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  async function startPayment() {
    if (phase === 'preparing' || phase === 'redirecting') return;

    setErrorMessage('');

    // Client-side pre-check with a friendly pointer (server validates again)
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!props.customerEmail || !EMAIL_RE.test(props.customerEmail.trim())) {
      setPhase('error');
      setErrorMessage('Please fill in your email address at the top of the form (Contact information), then try again.');
      try {
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement | null;
        emailInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => emailInput?.focus(), 300);
      } catch {}
      return;
    }

    setPhase('preparing');

    try {
      const res = await fetch('/api/airwallex/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: props.items,
          shippingMethod: props.shippingMethod,
          couponCode: props.couponCode || undefined,
          customer: {
            email: props.customerEmail,
            firstName: props.customerFirstName,
            lastName: props.customerLastName,
            phone: props.customerPhone || undefined,
          },
          shippingAddress: {
            address: props.shippingAddress,
            city: props.shippingCity,
            state: props.shippingState,
            postalCode: props.shippingPostalCode,
            country: props.shippingCountry,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Could not initialize card payment.');
      }
      const { intent_id, client_secret } = data;
      if (!intent_id || !client_secret) throw new Error('Payment initialization incomplete.');

      // Redirect to Airwallex's hosted payment page — same UX pattern as the
      // PayPal redirect. The customer pays there and is sent back to our
      // /checkout/success, which verifies the result with our server.
      setPhase('redirecting');
      window.location.href =
        `https://checkout.airwallex.com/?intent_id=${encodeURIComponent(intent_id)}` +
        `&client_secret=${encodeURIComponent(client_secret)}`;
    } catch (err: any) {
      console.error('airwallex startPayment error:', err);
      setPhase('error');
      setErrorMessage(
        err?.message || 'Something went wrong. Please try again or use PayPal below.',
      );
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={startPayment}
        disabled={phase === 'preparing' || phase === 'redirecting'}
        className="btn-primary w-full rounded-lg px-6 py-3 text-base font-semibold disabled:opacity-60"
      >
        {phase === 'preparing' && 'Preparing secure payment…'}
        {phase === 'redirecting' && 'Redirecting to secure payment page…'}
        {(phase === 'idle' || phase === 'error') && 'Pay with Card / Google Pay'}
      </button>

      {phase === 'error' && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={startPayment}
            className="mt-2 text-sm font-semibold text-primary underline"
          >
            Try card payment again
          </button>
        </div>
      )}

      <p className="mt-2 text-[11px] text-gray-400">
        You&apos;ll be redirected to Airwallex&apos;s secure payment page (Visa / Mastercard /
        Amex / Google Pay). Your card details never touch our servers.
      </p>
    </div>
  );
}
