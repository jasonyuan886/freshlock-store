'use client';

import { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    if (!buttonsRef.current) return;
    let cancelled = false;

    // Step 1: Fetch PayPal client ID from backend (server has PAYPAL_CLIENT_ID)
    fetch('/api/paypal/config')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const clientId = data.clientId;
        if (!clientId) {
          onError('PayPal is not configured.');
          setLoading(false);
          return;
        }

        // Step 2: Load PayPal SDK script
        const existingScript = document.querySelector<HTMLScriptElement>(
          'script[src*="paypal.com/sdk/js"]'
        );

        const onSdkReady = () => {
          if (cancelled || !buttonsRef.current) return;
          buttonsRef.current.innerHTML = '';

          try {
            window.paypal
              .Buttons({
                style: {
                  layout: 'vertical',
                  color: 'gold',
                  shape: 'pill',
                  label: 'paypal',
                  tagline: false,
                },
                fundingSource: window.paypal.FUNDING.PAYPAL,
                createOrder: async () => {
                  const res = await fetch('/api/paypal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      items: items.map((item) => ({
                        name: item.product.name,
                        price: item.product.price,
                        quantity: item.quantity,
                        slug: item.product.slug,
                      })),
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
                  if (data.success) {
                    onSuccess(data.orderId);
                  } else {
                    onError(data.error || 'Payment capture failed.');
                  }
                },
                onCancel: () => {},
                onError: (err: any) => {
                  console.error('PayPal Buttons error:', err);
                  onError('Payment error. Please try again or contact support.');
                },
              })
              .render(buttonsRef.current);
          } catch (err) {
            console.error('PayPal render error:', err);
            onError('Failed to load PayPal buttons.');
          }
          setLoading(false);
        };

        if (existingScript) {
          if (window.paypal) {
            onSdkReady();
          } else {
            const checkReady = setInterval(() => {
              if (window.paypal) {
                clearInterval(checkReady);
                onSdkReady();
              }
            }, 200);
            setTimeout(() => {
              clearInterval(checkReady);
              if (!window.paypal) setLoading(false);
            }, 10000);
          }
        } else {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
          script.async = true;
          script.onload = onSdkReady;
          script.onerror = () => {
            onError('Failed to load PayPal SDK.');
            setLoading(false);
          };
          document.head.appendChild(script);
        }
      })
      .catch(() => {
        if (!cancelled) {
          onError('Failed to load PayPal configuration.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [items, totalPrice, shipping, shippingInfo, onSuccess, onError]);

  if (loading) {
    return (
      <div className="py-4 text-center text-gray-500 text-sm">
        Loading PayPal...
      </div>
    );
  }

  return <div ref={buttonsRef} className="min-h-[50px]" />;
}
