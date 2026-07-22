'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import Image from 'next/image';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, shippingMethod, setShippingMethod, getShippingCost } = useCart();
  const shipping = getShippingCost();
  const total = totalPrice + shipping;
  const FREE_THRESHOLD = 99;

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
                <Image src={item.product.image} alt={item.product.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.slug}`}>
                  <h2 className="font-bold text-primary hover:underline">{item.product.name}</h2>
                </Link>
                <p className="text-accent font-bold mt-1">${item.product.price.toFixed(2)} AUD</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => updateQuantity(item.product.slug, item.quantity - 1)} className="w-10 h-10 min-h-[44px] flex items-center justify-center text-base hover:bg-gray-100 transition rounded-l-lg" aria-label="Decrease quantity">−</button>
                    <span className="px-2 text-sm font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.slug, item.quantity + 1)} className="w-10 h-10 min-h-[44px] flex items-center justify-center text-base hover:bg-gray-100 transition rounded-r-lg" aria-label="Increase quantity">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.slug)} className="text-red-500 text-sm hover:underline py-2 px-1 -ml-1 min-h-[44px] inline-flex items-center">Remove</button>
                </div>
                <p className="font-bold text-base sm:hidden mt-1 text-accent">${(item.product.price * item.quantity).toFixed(2)} AUD</p>
              </div>
              <div className="text-right hidden sm:block self-start">
                <p className="font-bold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow h-fit lg:sticky lg:top-24">
          <h2 className="font-bold text-primary text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm border-b pb-4 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>${totalPrice.toFixed(2)} AUD</span>
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
                    <span className="font-semibold text-sm">{totalPrice >= FREE_THRESHOLD ? <span className="text-accent">FREE</span> : '$12.95'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">7–12 business days, tracked air mail from Shenzhen</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${shippingMethod === 'express' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="shipping" value="express" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="mt-1 accent-primary" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Express Shipping</span>
                    <span className="font-semibold text-sm">{totalPrice >= FREE_THRESHOLD ? '$9.95' : '$22.95'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">3–5 business days, DHL Express from Shenzhen</p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2 text-sm border-b pb-4 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>{shipping === 0 ? <span className="text-accent font-medium">FREE</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>${total.toFixed(2)} AUD</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full block">Proceed to Checkout</Link>
          <Link href="/products" className="block text-center text-sm text-gray-500 hover:text-primary mt-4">← Continue Shopping</Link>
          {totalPrice < FREE_THRESHOLD && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              Add ${(FREE_THRESHOLD - totalPrice).toFixed(2)} more for FREE standard shipping!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
