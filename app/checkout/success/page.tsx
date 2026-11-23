'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { getAttribution } from '@/lib/attribution';

type CheckoutStatus = 'verifying' | 'invalid' | 'failed' | 'success';

const CAPTURE_RETURN_TIMEOUT_MS = 90_000;

// Keep the redirect return under the same deadline as the embedded checkout:
// one timer covers both the capture response and its JSON body.
async function fetchJsonWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ response: Response; data: any }> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      const error = new Error(`Payment request timed out after ${timeoutMs}ms`);
      error.name = 'TimeoutError';
      reject(error);
      controller.abort();
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([
      fetch(input, { ...init, signal: controller.signal }),
      timeoutPromise,
    ]);
    const data = await Promise.race([response.json(), timeoutPromise]).catch((error) => {
      if (error?.name === 'TimeoutError') throw error;
      return null;
    });
    return { response, data };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const paypalToken = searchParams.get('token'); // PayPal order ID
  const paymentMethod = searchParams.get('payment_method');
  const isPayPalReturn = paymentMethod === 'paypal' && Boolean(paypalToken);
  const orderNumber = searchParams.get('order_number');
  const isAirwallexReturn = paymentMethod === 'airwallex' && Boolean(orderNumber);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [status, setStatus] = useState<CheckoutStatus>('verifying');
  const [error, setError] = useState('');
  const { clearCart } = useCart();
  const capturedRef = useRef(false);

  useEffect(() => {
    if (capturedRef.current) return;
    if (isAirwallexReturn && orderNumber) {
      capturedRef.current = true;
      (async () => {
        for (let attempt = 0; attempt < 15; attempt++) {
          try {
            const r = await fetch(`/api/airwallex/status?order_number=${encodeURIComponent(orderNumber)}`);
            const d = await r.json();
            if (d?.paid) {
              setOrderInfo({
                order_id: d.orderNumber,
                paypal_order_id: null,
                customer_email: d.customer_email,
                amount_total: d.amount_total,
              });
              setStatus('success');
              try { clearCart(); } catch {}
              return;
            }
          } catch {}
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        setStatus('failed');
      })();
      return;
    }
    if (!isPayPalReturn || !paypalToken) {
      setStatus('invalid');
      return;
    }
    capturedRef.current = true;

    const capturePayPalReturn = async () => {
      // Contact + attribution survive the off-site PayPal round-trip.
      let pendingContact: any = {};
      let pendingAttribution: any = undefined;
      try {
        const c = localStorage.getItem('freshlock-pending-contact');
        if (c) pendingContact = JSON.parse(c) || {};
        const a = localStorage.getItem('freshlock-pending-attribution');
        if (a) pendingAttribution = JSON.parse(a)?.attribution;
      } catch {}
      if (!pendingAttribution) {
        try { pendingAttribution = getAttribution() || {}; } catch {}
      }

      try {
        const { response: res, data } = await fetchJsonWithTimeout('/api/paypal', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: paypalToken,
            attribution: pendingAttribution || undefined,
            contact: {
              email: pendingContact.email || undefined,
              name: pendingContact.name || undefined,
              phone: pendingContact.phone || undefined,
            },
          }),
        }, CAPTURE_RETURN_TIMEOUT_MS);
        if (!res.ok || !data?.success) {
          setError(data?.error || 'Payment verification failed. Please contact support.');
          setStatus('failed');
          return;
        }

        let confirmationEmailStatus = data.confirmationEmailStatus || 'unavailable';
        try {
          const storageKey = `freshlock_confirmation_email_${paypalToken}`;
          const firstCaptureStatus = window.sessionStorage.getItem(storageKey);
          if (
            confirmationEmailStatus === 'unavailable' &&
            typeof firstCaptureStatus === 'string' &&
            ['sent', 'failed', 'not_configured', 'no_email'].includes(firstCaptureStatus)
          ) {
            confirmationEmailStatus = firstCaptureStatus;
          }
          window.sessionStorage.removeItem(storageKey);
        } catch {}
        setOrderInfo({
          order_id: data.orderNumber || data.orderId,
          paypal_order_id: data.orderId,
          amount_total: data.amount * 100,
          customer_email: data.payerEmail,
          customer_name: data.payerName,
          confirmation_email_status: confirmationEmailStatus,
        });
        try {
          localStorage.removeItem('freshlock-pending-contact');
          localStorage.removeItem('freshlock-pending-attribution');
        } catch {}
        clearCart();
        setStatus('success');
      } catch (err: any) {
        console.error('PayPal capture error:', err);
        setError(err?.name === 'TimeoutError'
          ? 'Payment verification timed out. Please refresh the page to check your order status or contact support@freshlocksealer.com.'
          : 'Unable to verify payment. Please contact support@freshlocksealer.com.');
        setStatus('failed');
      }
    };

    void capturePayPalReturn();
  }, [isPayPalReturn, paypalToken, clearCart]);

  if (status === 'verifying') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Verifying your payment...</p>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">Unable to Verify Checkout</h1>
        <p className="text-gray-600 mb-6">
          This checkout return link is invalid, incomplete, or uses an unsupported payment reference.
          No order success has been confirmed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/checkout" className="btn-primary">Return to Checkout</Link>
          <Link href="/contact" className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition">
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Issue</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <p className="text-gray-500 text-sm mb-8">
          If you were charged, please contact <strong>support@freshlocksealer.com</strong> with
          order reference <strong>{paypalToken}</strong> and we'll resolve it.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/contact" className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition">
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-3xl font-bold text-primary mb-4">Thank You!</h1>
      <p className="text-gray-600 mb-2">Your order has been placed successfully.</p>
      {orderInfo?.order_id && (
        <p className="text-gray-500 mb-1">Order Number: <strong>{orderInfo.order_id}</strong></p>
      )}
      {orderInfo?.paypal_order_id && (
        <p className="text-gray-400 text-sm mb-4">PayPal reference: <strong>{orderInfo.paypal_order_id}</strong></p>
      )}
      {orderInfo?.customer_email && orderInfo?.confirmation_email_status === 'sent' && (
        <p className="text-gray-500 mb-2">
          A confirmation email has been sent to <strong>{orderInfo.customer_email}</strong>
        </p>
      )}
      {['failed', 'not_configured'].includes(orderInfo?.confirmation_email_status) && (
        <p className="text-amber-700 mb-2">
          Your payment is confirmed, but we could not confirm that a confirmation email was sent. Please contact support with your PayPal reference.
        </p>
      )}
      {orderInfo?.confirmation_email_status === 'unavailable' && (
        <p className="text-gray-500 mb-2">
          We could not confirm the email status on this return. Your order remains confirmed; contact support if you need a receipt.
        </p>
      )}
      {orderInfo?.customer_email && !['sent', 'failed', 'not_configured'].includes(orderInfo?.confirmation_email_status) && (
        <p className="text-gray-500 mb-2">Order contact email: <strong>{orderInfo.customer_email}</strong></p>
      )}
      {orderInfo?.amount_total ? (
        <p className="text-2xl font-bold text-primary mb-8">
          Total: ${(orderInfo.amount_total / 100).toFixed(2)} USD
        </p>
      ) : null}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
        <h2 className="font-bold text-primary mb-3">What's Next?</h2>
        <ul className="space-y-2 text-gray-600">
          <li>📦 We'll prepare your order within 1-2 business days</li>
          <li>🚚 Standard shipping takes 7–15 days</li>
          <li>📧 You'll receive a tracking number via email</li>
        </ul>
      </div>
      <div className="flex gap-4 justify-center">
        <Link href="/" className="btn-primary">Back to Home</Link>
        <Link href="/products" className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-20 text-center"><div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div><p className="text-gray-500">Loading...</p></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
