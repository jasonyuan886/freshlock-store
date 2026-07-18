'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import Image from 'next/image';
<<<<<<< Updated upstream

const FREE_THRESHOLD = 99;
const STANDARD_FEE = 12.95;
const EXPRESS_FEE = 22.95;
const EXPRESS_UPGRADE = 9.95;
=======
>>>>>>> Stashed changes

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, shippingMethod, setShippingMethod, getShippingCost } = useCart();
  const shipping = getShippingCost();
  const total = totalPrice + shipping;

  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', postcode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const shippingCost = getShippingCost();
      if (paymentMethod === 'stripe') {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, shippingInfo: { email: form.email }, shippingMethod, shippingCost }),
        });
        const data = await res.json();
        if (data.url) { window.location.href = data.url; }
        else if (data.error) { setError(data.error); setProcessing(false); }
        else { alert('⚠️ Stripe not configured yet. Demo mode — order simulated.'); clearCart(); setProcessing(false); }
      } else if (paymentMethod === 'paypal') {
        const res = await fetch('/api/paypal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(item => ({ name: item.product.name, price: item.product.price, quantity: item.quantity })),
            shippingAddress: {
              name: `${form.firstName} ${form.lastName}`,
              address: form.address, city: form.city, state: form.state, postalCode: form.postcode,
            },
            shippingMethod,
            shippingCost,
          }),
        });
        const data = await res.json();
        if (data.approvalUrl) { window.location.href = data.approvalUrl; }
        else if (data.error) { setError(data.error); setProcessing(false); }
        else { alert('⚠️ PayPal not configured yet.'); setProcessing(false); }
      } else if (paymentMethod === 'afterpay') {
        alert('Afterpay integration requires a merchant account. Please contact FreshLock support.');
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Nothing to Checkout</h1>
        <p className="text-gray-500 mb-8">Your cart is empty.</p>
        <Link href="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8">Checkout</h1>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="font-bold text-primary text-lg mb-4">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="font-bold text-primary text-lg mb-4">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input type="text" name="address" value={form.address} onChange={handleChange} required placeholder="123 Example Street"
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City / Suburb</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} required
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select name="state" value={form.state} onChange={handleChange} required
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white">
                    <option value="">Select state</option>
                    <option value="NSW">NSW</option><option value="VIC">VIC</option><option value="QLD">QLD</option>
                    <option value="WA">WA</option><option value="SA">SA</option><option value="TAS">TAS</option>
                    <option value="ACT">ACT</option><option value="NT">NT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                  <input type="text" name="postcode" value={form.postcode} onChange={handleChange} required maxLength={4} pattern="[0-9]{4}" placeholder="2000"
                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input type="text" value="Australia" readOnly className="w-full border rounded-lg px-4 py-2.5 bg-gray-50 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="font-bold text-primary text-lg mb-4">Shipping Method</h2>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${shippingMethod === 'standard' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="shipmethod" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="mt-1 accent-primary" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Standard Shipping</span>
                      <span className="font-semibold">{totalPrice >= FREE_THRESHOLD ? <span className="text-accent">FREE</span> : `$${STANDARD_FEE.toFixed(2)}`}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">7–12 business days · Tracked air mail from Shenzhen, China</p>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${shippingMethod === 'express' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="shipmethod" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="mt-1 accent-primary" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Express Shipping (DHL)</span>
                      <span className="font-semibold">{totalPrice >= FREE_THRESHOLD ? `$${EXPRESS_UPGRADE.toFixed(2)} upgrade` : `$${EXPRESS_FEE.toFixed(2)}`}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">3–5 business days · DHL Express from Shenzhen, China</p>
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                ℹ️ Remote area surcharges may apply for express delivery to some postcodes. We will contact you if additional fees apply.
              </p>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="font-bold text-primary text-lg mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary" />
                  <div>
                    <span className="font-medium">💳 Credit / Debit Card</span>
                    <p className="text-xs text-gray-500 mt-0.5">Visa, Mastercard, Amex — powered by Stripe</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary" />
                  <div>
                    <span className="font-medium">🅿️ PayPal</span>
                    <p className="text-xs text-gray-500 mt-0.5">Pay with your PayPal account</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${paymentMethod === 'afterpay' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="afterpay" checked={paymentMethod === 'afterpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary" />
                  <div>
                    <span className="font-medium">🟣 Afterpay</span>
                    <p className="text-xs text-gray-500 mt-0.5">4 interest-free payments</p>
                  </div>
                </label>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-start gap-2">
                <span className="text-green-600">🔒</span>
                <p className="text-xs text-green-700">Your payment information is encrypted and secure. We never store your card details.</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow sticky top-24">
              <h2 className="font-bold text-primary text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product.slug} className="flex gap-3">
<<<<<<< Updated upstream
                    <Image src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" />
=======
                    <Image src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg object-cover" />
>>>>>>> Stashed changes
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping ({shippingMethod === 'express' ? 'Express' : 'Standard'})</span>
                  <span>{shipping === 0 ? <span className="text-accent font-medium">FREE</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                {totalPrice < FREE_THRESHOLD && (
                  <p className="text-xs text-gray-400">Add ${(FREE_THRESHOLD - totalPrice).toFixed(2)} more for FREE standard shipping!</p>
                )}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)} AUD</span>
              </div>
              <button type="submit" disabled={processing}
                className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : `Pay $${total.toFixed(2)} AUD`}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">🔒 Secure checkout — your data is encrypted</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
