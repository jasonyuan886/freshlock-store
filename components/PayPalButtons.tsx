'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
}

export default function PayPalButtons({
  items,
  totalPrice,
  shipping,
  shippingInfo,
  onSuccess,
  onError,
}: PayPalButtonsProps) {
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);

  // Stabilize callbacks so they don't cause infinite re-renders
  const handleSuccess = useCallback(
    (orderId: string) => onSuccess(orderId),
    [onSuccess]
  );
  const handleError = useCallback(
    (msg: string) => onError(msg),
    [onError]
  );

  // Load PayPal SDK once
  useEffect(() => {
    const clientId =
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
      'AXN5OatqRTqARNS8Op_oHXqtvokFlvzlppWEsmoQdSAXFvnfxnU7RRfk-tG0hVeZRsxzZ1KXf4mCFooh';

    if (!clientId) {
      handleError('PayPal is not configured.');
      setLoading(false);
      return;
    }

    // If already loaded globally, use it
    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    // Check if script already in DOM
    const existing = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existing) {
      // Wait for it to initialize
      const t = setInterval(() => {
        if (window.paypal) { clearInterval(t); setSdkReady(true); }
      }, 200);
      setTimeout(() => { clearInterval(t); if (!window.paypal) { handleError('PayPal SDK timeout.'); setLoading(false); } }, 10000);
      return;
    }

    // Inject script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons&commit=true`;
    script.async = true;
    script.onload = () => {
      // Give SDK a moment to set window.paypal
      const t = setInterval(() => {
        if (window.paypal) { clearInterval(t); setSdkReady(true); }
      }, 200);
      setTimeout(() => { clearInterval(t); if (!window.paypal) { handleError('PayPal SDK failed to initialize.'); setLoading(false); } }, 10000);
    };
    script.onerror = () => {
      handleError('Failed to load PayPal SDK.');
      setLoading(false);
    };
    document.head.appendChild(script);
  }, [handleError]);

  // Render buttons when SDK is ready
  useEffect(() => {
    if (!sdkReady || !buttonsRef.current || !window.paypal) return;

    buttonsRef.current.innerHTML = '';

    try {
      window.paypal
        .Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'paypal', tagline: false },
          fundingSource: window.paypal.FUNDING.PAYPAL,
          createOrder: async () => {
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
          },
          onApprove: async (_data: any, actions: any) => {
            const res = await fetch('/api/paypal', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: actions.orderID }),
            });
            const data = await res.json();
            if (data.success) handleSuccess(data.orderId);
            else handleError(data.error || 'Payment capture failed.');
          },
          onCancel: () => {},
          onError: (err: any) => {
            console.error('PayPal Buttons error:', err);
            handleError('Payment error. Please try again.');
          },
        })
        .render(buttonsRef.current);
    } catch (err) {
      console.error('PayPal render error:', err);
      handleError('Failed to render PayPal buttons.');
    }
    setLoading(false);
  }, [sdkReady, items, totalPrice, shipping, shippingInfo, handleSuccess, handleError]);

  if (loading) {
    return (
      <div className="py-4 text-center text-gray-500 text-sm">
        Loading PayPal...
      </div>
    );
  }

  return <div ref={buttonsRef} className="min-h-[50px]" />;
}
