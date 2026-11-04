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

  // Component-scoped init guards. Deliberately NOT window globals: a remount
  // inside the SPA must be able to build a fresh set of fields, and a stale
  // global flag would leave the whole payment area blank.
  const sdkLoadStartedRef = useRef(false);
  const renderStartedRef = useRef(false);

  // Latest-props mirror. The PayPal SDK captures its callbacks exactly once at
  // render time, so every callback must read through this ref instead of a
  // closed-over prop. Without it the order is created with the empty shipping
  // address captured on first paint, and "Pay" silently does nothing.
  const latest = useRef({ items, shippingInfo, contactEmail, onSuccess, onError });
  useEffect(() => {
    latest.current = { items, shippingInfo, contactEmail, onSuccess, onError };
  });

  const handleError = useCallback((msg: string) => {
    try {
      if (latest.current.onError) latest.current.onError(msg);
    } catch (e) {}
  }, []);

  const handleSuccess = useCallback((orderId: string) => {
    try {
      if (latest.current.onSuccess) latest.current.onSuccess(orderId);
    } catch (e) {}
  }, []);

  // Stash contact+attribution (mirrors the redirect flow) and return the payload
  const buildOrderPayload = useCallback(() => {
    const si = latest.current.shippingInfo;
    const ce = latest.current.contactEmail;
    const attribution = getAttribution();
    const contact = {
      name: si.name || '',
      email: ce || '',
      phone: si.phone || '',
    };
    try {
      localStorage.setItem('freshlock-pending-contact', JSON.stringify(contact));
      localStorage.setItem('freshlock-pending-attribution', JSON.stringify(attribution));
    } catch (e) {}
    return { contact, attribution };
  }, []);

  const createOrder = useCallback(async () => {
    const cartItems = latest.current.items;
    const si = latest.current.shippingInfo;
    const res = await fetch('/api/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map((i) => ({
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          slug: i.product.slug,
        })),
        shippingAddress: si,
      }),
    });
    const data = await res.json();
    if (data.orderId) return data.orderId;
    throw new Error(data.error || 'Failed to create order');
  }, []);

  const captureOrder = useCallback(
    async (orderId: string) => {
      const payload = buildOrderPayload();
      const res = await fetch('/api/paypal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          contact: payload.contact,
          attribution: payload.attribution,
        }),
      });
      const data = await res.json();
      if (data.success) handleSuccess(data.orderId || orderId);
      else handleError(data.error || 'Payment failed');
    },
    [buildOrderPayload, handleSuccess, handleError]
  );

  // 1) Load the PayPal SDK exactly once per mount.
  useEffect(() => {
    if (sdkLoadStartedRef.current) return;
    sdkLoadStartedRef.current = true;

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
    if (!clientId) {
      handleError('Payment system is not configured.');
      setLoading(false);
      return;
    }
    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons,card-fields&commit=true`;
    script.async = true;
    script.onload = () => {
      const t = setInterval(() => {
        if (window.paypal) {
          clearInterval(t);
          setSdkReady(true);
        }
      }, 200);
      setTimeout(() => {
        clearInterval(t);
        if (!window.paypal) {
          handleError('Payment SDK failed to initialize.');
          setLoading(false);
        }
      }, 10000);
    };
    script.onerror = () => {
      handleError('Failed to load payment system.');
      setLoading(false);
    };
    document.head.appendChild(script);
  }, [handleError]);

  // 2) Render the PayPal button + inline card fields exactly once per mount.
  useEffect(() => {
    if (!sdkReady || !window.paypal) return;
    if (!buttonsRef.current) return;
    if (renderStartedRef.current) return;
    renderStartedRef.current = true;

    const clearSlot = (id: string) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    };

    // Wipe any previous markup so a remount can never stack duplicate iframes.
    buttonsRef.current.innerHTML = '';
    clearSlot('fl-card-number');
    clearSlot('fl-card-expiry');
    clearSlot('fl-card-cvv');

    try {
      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'black',
            shape: 'pill',
            label: 'paypal',
            tagline: false,
          },
          createOrder,
          onApprove: async (_d: any, actions: any) => {
            await captureOrder(actions.orderID);
          },
          onError: (err: any) => {
            console.error('PayPal button error', err);
            handleError(
              'PayPal payment failed. Please try again or use the card form below.'
            );
          },
        })
        .render(buttonsRef.current)
        .catch((e: any) => {
          console.error('render paypal button', e);
          handleError('PayPal button could not load. Please use the card form below.');
        });
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
            clearSlot('fl-card-number');
            clearSlot('fl-card-expiry');
            clearSlot('fl-card-cvv');
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
    if (!cardFieldsRef.current) {
      handleError('Card form is not ready yet. Please refresh the page and try again.');
      return;
    }
    const si = latest.current.shippingInfo;
    setCardSubmitting(true);
    buildOrderPayload();
    try {
      await cardFieldsRef.current.submit({
        cardholderName: si.name || '',
        billingAddress: {
          streetAddress: si.address || '',
          locality: si.city || '',
          region: si.state || '',
          postalCode: si.postalCode || '',
          countryCodeAlpha2: (si.country || 'US').slice(0, 2).toUpperCase(),
        },
      });
    } catch (e) {
      setCardSubmitting(false);
      handleError('Could not submit card payment. Please try again.');
    }
  };

  return (
    <div className="w-full">
      {loading && (
        <p className="text-sm text-gray-500">Loading secure payment options…</p>
      )}

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
            <div
              id="fl-card-number"
              className="min-h-10 border border-gray-300 rounded-md bg-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <div
                id="fl-card-expiry"
                className="min-h-10 border border-gray-300 rounded-md bg-white"
              />
              <div
                id="fl-card-cvv"
                className="min-h-10 border border-gray-300 rounded-md bg-white"
              />
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
