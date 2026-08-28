'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { trackPurchase } from '@/lib/ga4';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paypalToken = searchParams.get('token'); // PayPal order ID
  const payerId = searchParams.get('PayerID');
  const paymentMethod = searchParams.get('payment_method');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { clearCart, items: cartItems } = useCart();
  const capturedRef = useRef(false);

  useEffect(() => {
    // --- PayPal flow ---
    if (paymentMethod === 'paypal' && paypalToken && !capturedRef.current) {
      capturedRef.current = true;
      // Capture the PayPal payment
      fetch('/api/paypal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: paypalToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrderInfo({
              order_id: data.orderId,
              amount_total: data.amount * 100, // Convert to cents for compatibility
              customer_email: data.payerEmail,
              customer_name: data.payerName,
              items: data.items,
            });

            // Fire GA4 purchase event
            const purchaseItems = (data.items && data.items.length > 0
              ? data.items
              : cartItems.map((ci: any) => ({
                  name: ci.product?.name,
                  price: ci.product?.price,
                  quantity: ci.quantity,
                }))
            ).map((i: any) => ({
              item_id: i.slug || i.product?.slug || '',
              item_name: i.name || i.product?.name || 'Product',
              price: i.price || i.product?.price || 0,
              quantity: i.quantity || 1,
            }));

            if (purchaseItems.length > 0) {
              trackPurchase(data.orderId || paypalToken, purchaseItems, data.amount || 0);
            }

            clearCart();
          } else {
            setError(data.error || 'Payment verification failed.');
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('PayPal capture error:', err);
          setError('Unable to verify payment. Please contact support@freshlocksealer.com.');
          setLoading(false);
        });
    }
    // --- Stripe flow ---
    else if (sessionId) {
      fetch(`/api/checkout/success?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrderInfo(data);
            if (data.items && data.items.length > 0) {
              trackPurchase(
                data.session_id || data.order_id || 'unknown',
                data.items.map((i: any) => ({
                  item_id: i.slug || i.product?.slug || '',
                  item_name: i.name || i.product?.name || '',
                  price: i.price || i.product?.price || 0,
                  quantity: i.quantity || 1,
                })),
                data.amount_total ? data.amount_total / 100 : 0,
              );
            }
            clearCart();
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId, paypalToken, payerId, paymentMethod, clearCart, cartItems]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Verifying your payment...</p>
      </div>
    );
  }

  if (error) {
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
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
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
        <p className="text-gray-500 mb-4">
          Order ID: <strong>{orderInfo.order_id}</strong>
        </p>
      )}

      {orderInfo?.customer_email && (
        <p className="text-gray-500 mb-6">
          A confirmation email has been sent to <strong>{orderInfo.customer_email}</strong>
        </p>
      )}

      {orderInfo?.amount_total ? (
        <p className="text-2xl font-bold text-primary mb-8">
          Total: ${(orderInfo.amount_total / 100).toFixed(2)} USD
        </p>
      ) : orderInfo?.amount ? (
        <p className="text-2xl font-bold text-primary mb-8">
          Total: ${orderInfo.amount.toFixed(2)} USD
        </p>
      ) : null}

      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
        <h2 className="font-bold text-primary mb-3">What's Next?</h2>
        <ul className="space-y-2 text-gray-600">
          <li>📦 We'll prepare your order within 1-2 business days</li>
          <li>🚚 Standard shipping takes 3-7 business days</li>
          <li>📧 You'll receive a tracking number via email</li>
        </ul>
      </div>

      <div className="flex gap-4 justify-center">
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
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
