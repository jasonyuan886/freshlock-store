'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getAttribution } from '@/lib/attribution';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalButtonsProps {
  items: Array<{
    product: { name: string; price: number; slug: string };
    quantity: number;
  }>;
  totalPrice: number;
  shipping: number;
  shippingInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  contactEmail?: string;
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
}

export default function PayPalButtons({
  items,
  totalPrice,
  shipping,
  shippingInfo,
  contactEmail,
  onSuccess,
  onError,
}: PayPalButtonsProps) {
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [cardEligible, setCardEligible] = useState(false);
  const [cardSubmitting, setCardSubmitting] = useState(false);
  const cardFieldsRef = useRef<any>(null);

  const handleSuccess = useCallback(
    (orderId: string) => onSuccess(orderId),
    [onSuccess]
  );
  const handleError = useCallback(
    (msg: string) => onError(msg),
    [onError]
  );

  // Stash contact+attribution (mirrors the redirect flow) and return the payload
  const buildOrderPayload = useCallback(() => {
    const attribution = getAttribution();
    const contact = {
      name: shippingInfo.name || '',
      email: contactEmail || '',
      phone: shippingInfo.phone || '',
    };
    try {
      localStorage.setItem('freshlock-pending-contact', JSON.stringify(contact));
      localStorage.setItem('freshlock-pending-attribution', JSON.stringify(attribution));
    } catch (e) {}
    return { contact, attribution };
  }, [shippingInfo, contactEmail]);

  const createOrder = useCallback(async () => {
    const res = await fetch('/api/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ name: i.product.name, price: i.product.price, quantity: i.quantity, slug: i.product.slug })),
        shippingAddress: shippingInfo,
      }),
    });
    const data = await res.json();
    if (data.orderId) return data.orderId;
    throw new Error(data.error || 'Failed to create order');
  }, [items, shippingInfo]);

  const captureOrder = useCallback(async (orderId: string) => {
    const { contact, attribution } = buildOrderPayload();
    const res = await fetch('/api/paypal', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, contact, attribution }),
    });
    const data = await res.json();
    if (data.success) handleSuccess(data.orderId || orderId);
    else handleError(data.error || 'Payment failed');
  }, [buildOrderPayload, handleSuccess, handleError]);

  // Load PayPal SDK once (buttons + card-fields; NO enable-funding=googlepay — it 400s the whole SDK)
  useEffect(() => {
    const clientId =
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
    if (!clientId) {
      handleError('Payment system is not configured.');
      setLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons,card-fields&commit=true`;
    script.async = true;
    script.onload = () => {
      const t = setInterval(() => {
        if (window.paypal) { clearInterval(t); setSdkReady(true); }
      }, 200);
      setTimeout(() => { clearInterval(t); if (!window.paypal) { handleError('Payment SDK failed to initialize.'); setLoading(false); } }, 10000);
    };
    script.onerror = () => {
      handleError('Failed to load payment system.');
      setLoading(false);
    };
    document.head.appendChild(script);
  }, [handleError]);

  // Render PayPal button + inline card fields
  useEffect(() => {
    if (!sdkReady || !buttonsRef.current || !window.paypal) return;

    buttonsRef.current.innerHTML = '';

    try {
      window.paypal
        .Buttons({
          style: { layout: 'vertical', color: 'black', shape: 'pill', label: 'paypal', tagline: false },
          fundingSource: window.paypal.FUNDING.PAYPAL,
          createOrder,
          onApprove: async (_d: any, actions: any) => {
            await captureOrder(actions.orderID);
          },
          onError: (err: any) => {
            console.error('PayPal button error', err);
            handleError('PayPal payment failed. Please try again or use the card form below.');
          },
        })
        .render(buttonsRef.current)
        .catch((e: any) => console.error('render paypal button', e));
    } catch (e) {
      console.error('paypal buttons init', e);
    }

    // Inline card fields (CardFields / ACDC) — no PayPal account needed, no redirect
    try {
      const cf = window.paypal.CardFields?.({
        createOrder,
        onApprove: async (data: any) => {
          setCardSubmitting(false);
          await captureOrder(data.orderID);
        },
        onError: (err: any) => {
          setCardSubmitting(false);
          console.error('CardFields error', err);
          handleError('Card payment failed. Check your card details and try again.');
        },
      });
      if (cf && cf.isEligible && cf.isEligible()) {
        cardFieldsRef.current = cf;
        setCardEligible(true);
        setTimeout(() => {
          try {
            cf.NumberField({ placeholder: 'Card number' }).render('#fl-card-number');
            cf.ExpiryField({ placeholder: 'MM / YY' }).render('#fl-card-expiry');
            cf.CVVField({ placeholder: 'CVV' }).render('#fl-card-cvv');
          } catch (e) {
            console.error('card fields render', e);
            setCardEligible(false);
          }
        }, 50);
      }
    } catch (e) {
      console.error('cardfields init', e);
    }

    setLoading(false);
  }, [sdkReady, createOrder, captureOrder, handleError]);

  const submitCard = async () => {
    if (!cardFieldsRef.current) return;
    setCardSubmitting(true);
    buildOrderPayload();
    try {
      await cardFieldsRef.current.submit({
        cardholderName: shippingInfo.name || '',
        billingAddress: {
          streetAddress: shippingInfo.address || '',
          locality: shippingInfo.city || '',
          region: shippingInfo.state || '',
          postalCode: shippingInfo.postalCode || '',
          countryCodeAlpha2: (shippingInfo.country || 'US').slice(0, 2).toUpperCase(),
        },
      });
    } catch (e) {
      setCardSubmitting(false);
      handleError('Could not submit card payment. Please try again.');
    }
  };

  return (
    <div className="w-full">
      {loading && <p className="text-sm text-gray-500">Loading secure payment options…</p>}

      {/* PayPal account button */}
      <div ref={buttonsRef} className="min-h-[40px]" />

      {cardEligible && (
        <div className="mt-4">
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500">or pay with card</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-2">
            <div id="fl-card-number" className="min-h-10 border border-gray-300 rounded-md bg-white" />
            <div className="grid grid-cols-2 gap-2">
              <div id="fl-card-expiry" className="min-h-10 border border-gray-300 rounded-md bg-white" />
              <div id="fl-card-cvv" className="min-h-10 border border-gray-300 rounded-md bg-white" />
            </div>
          </div>

          <button
            type="button"
            onClick={submitCard}
            disabled={cardSubmitting}
            className="mt-3 w-full h-11 rounded-md bg-gray-900 text-white font-semibold text-sm disabled:opacity-60"
          >
            {cardSubmitting ? 'Processing…' : `Pay $${totalPrice.toFixed(2)}`}
          </button>

          <p className="mt-2 text-[11px] text-gray-500">
            Cards processed securely by PayPal. No PayPal account needed.
          </p>
        </div>
      )}
    </div>
  );
}
