'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import Image from 'next/image';

const FREE_THRESHOLD = 99;

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, shippingMethod, setShippingMethod, getShippingCost } = useCart();
  const shipping = getShippingCost();
  const total = totalPrice + shipping;
  const away = FREE_THRESHOLD - totalPrice;
  const freeUnlocked = totalPrice >= FREE_THRESHOLD;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Looks like you have not added anything yet.</p>
        <Link href="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.slug} className="bg-white rounded-xl p-3 sm:p-6 shadow flex gap-3 sm:gap-6">
              <Link href={`/products/${item.product.slug}`}>
                <Image src={item.product.image} alt={item.product.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover" width={128} height={128} />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.slug}`}>
                  <h2 className="font-bold text-primary hover:underline">{item.product.name}</h2>
                </Link>
                <p className="text-accent font-bold mt-1">A${item.product.price.toFixed(2)}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => updateQuantity(item.product.slug, item.quantity - 1)} className="w-10 h-10 min-h-[44px] flex items-center justify-center text-base hover:bg-gray-100 transition rounded-l-lg" aria-label="Decrease quantity">−</button>
                    <span className="px-2 text-sm font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.slug, item.quantity + 1)} className="w-10 h-10 min-h-[44px] flex items-center justify-center text-base hover:bg-gray-100 transition rounded-r-lg" aria-label="Increase quantity">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.slug)} className="text-red-500 text-sm hover:underline py-2 px-1 -ml-1 min-h-[44px] inline-flex items-center">Remove</button>
                </div>
                <p className="font-bold text-base sm:hidden mt-1 text-accent">A${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="text-right hidden sm:block self-start">
                <p className="font-bold text-lg">A${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow h-fit lg:sticky lg:top-24">
          <h2 className="font-bold text-primary text-lg mb-4">Order Summary</h2>

          {/* Free-shipping nudge (top, prominent) */}
          {!freeUnlocked ? (
            <div className="mb-4 rounded-lg bg-accent/10 border border-accent/20 p-3 text-sm">
              <p className="font-semibold text-accent">
                You&apos;re <span className="text-base">A${away.toFixed(2)}</span> away from FREE shipping! 🎉
              </p>
              <p className="text-gray-600 mt-1.5 text-xs leading-relaxed">
                Add a pack of{' '}
                <Link href="/products/vacuum-seal-bags-30-pack" className="underline text-primary font-medium hover:text-primary-700">
                  30 Vacuum Bags for A$29.99
                </Link>{' '}
                to qualify — perfect for keeping your food fresh.
              </p>
            </div>
          ) : (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm">
              <p className="font-semibold text-green-700">🎉 You&apos;ve unlocked FREE standard shipping!</p>
            </div>
          )}

          <div className="space-y-2 text-sm border-b pb-4 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>A${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping method selector */}
          <div className="mb-4">
            <p className="font-semibold text-sm text-gray-700 mb-2">Shipping Method</p>
            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${shippingMethod === 'standard' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="shipping" value="standard" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="mt-1 accent-primary" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Standard Shipping</span>
                    <span className="font-semibold text-sm">{freeUnlocked ? <span className="text-accent">FREE</span> : 'A$12.95'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">7–12 business days, tracked air mail from Shenzhen</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${shippingMethod === 'express' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="shipping" value="express" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="mt-1 accent-primary" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Express Shipping</span>
                    <span className="font-semibold text-sm">{freeUnlocked ? 'A$9.95' : 'A$22.95'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">3–5 business days, DHL Express from Shenzhen</p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2 text-sm border-b pb-4 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>{shipping === 0 ? <span className="text-accent font-medium">FREE</span> : `A$${shipping.toFixed(2)}`}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>A${total.toFixed(2)}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full block">Proceed to Checkout</Link>
          <Link href="/products" className="block text-center text-sm text-gray-500 hover:text-primary mt-4">← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
