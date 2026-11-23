'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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

type Phase = 'idle' | 'preparing' | 'ready' | 'processing' | 'success' | 'error';

export default function AirwallexPayment(props: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementRef = useRef<any>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');

  function resetElement() {
    try {
      elementRef.current?.destroy?.();
    } catch {
      // ignore
    }
    elementRef.current = null;
    if (containerRef.current) containerRef.current.innerHTML = '';
  }

  async function startPayment() {
    if (phase === 'preparing' || phase === 'processing' || phase === 'ready') return;

    setErrorMessage('');
    setPhase('preparing');

    try {
      // 1. Create payment intent server-side (order + intent are created there)
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
      const { intent_id, client_secret, order_number } = data;
      if (!intent_id || !client_secret) throw new Error('Payment initialization incomplete.');

      setOrderNumber(order_number);

      // 2. Load Airwallex SDK and mount the drop-in (cards + Google Pay only)
      const sdk = await import('@airwallex/components-sdk');
      await (sdk as any).init?.({ env: 'prod' });

      resetElement();
      // createElement resolves asynchronously in current SDK versions
      let element: any = await Promise.resolve(
        sdk.createElement('dropIn', {
          client_secret,
          currency: 'USD',
          methods: ['card', 'googlepay'],
        } as any),
      );
      if (!element || typeof element.on !== 'function' || typeof element.mount !== 'function') {
        throw new Error('Airwallex payment form could not be initialized.');
      }

      element.on('ready', () => setPhase('ready'));
      element.on('success', async () => {
        setPhase('processing');
        try {
          // Ask our server to verify + finalize (idempotent with webhook)
          const fin = await fetch('/api/airwallex/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intent_id }),
          });
          const finData = await fin.json().catch(() => ({}));
          setPhase('success');
          router.push(
            `/checkout/success?payment_method=airwallex&order_number=${encodeURIComponent(
              finData?.orderNumber || order_number,
            )}`,
          );
        } catch {
          // Even if finalize call fails, webhook will finalize; still land on success page
          setPhase('success');
          router.push(
            `/checkout/success?payment_method=airwallex&order_number=${encodeURIComponent(order_number)}`,
          );
        }
      });
      element.on('error', (evt: any) => {
        console.error('airwallex drop-in error:', evt);
        setPhase('error');
        setErrorMessage(
          (evt && (evt.message || evt.error?.message)) ||
            'Card payment could not be completed. Please try again or use PayPal below.',
        );
        resetElement();
      });

      element.mount('#awx-dropin-container');
      elementRef.current = element;
    } catch (err: any) {
      console.error('airwallex startPayment error:', err);
      setPhase('error');
      setErrorMessage(
        err?.message?.includes('Could not initialize') || err?.message?.includes('fetch')
          ? 'Card payment is temporarily unavailable — please use PayPal below.'
          : err?.message || 'Something went wrong. Please try again or use PayPal below.',
      );
      resetElement();
    }
  }

  return (
    <div className="w-full">
      {phase !== 'ready' && phase !== 'processing' && phase !== 'success' && (
        <button
          type="button"
          onClick={startPayment}
          disabled={phase === 'preparing'}
          className="btn-primary w-full rounded-lg px-6 py-3 text-base font-semibold disabled:opacity-60"
        >
          {phase === 'preparing' ? 'Preparing secure card payment…' : 'Pay with Card / Google Pay'}
        </button>
      )}

      {(phase === 'preparing' || phase === 'ready' || phase === 'processing') && (
        <div className="mt-3">
          <div id="awx-dropin-container" ref={containerRef} />
          {phase === 'preparing' && (
            <p className="mt-2 text-xs text-gray-500">Loading secure payment form…</p>
          )}
        </div>
      )}

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
        Secure card payment by Airwallex. Your card details are encrypted and never touch our servers.
      </p>
    </div>
  );
}
