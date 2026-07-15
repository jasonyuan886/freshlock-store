'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-3xl font-bold text-primary mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Looks like you have not added anything yet.</p>
        <Link href="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.slug}
              className="bg-white rounded-xl p-4 sm:p-6 shadow flex gap-4 sm:gap-6"
            >
              <Link href={`/products/${item.product.slug}`}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.slug}`}>
                  <h2 className="font-bold text-primary hover:underline">{item.product.name}</h2>
                </Link>
                <p className="text-accent font-bold mt-1">${item.product.price.toFixed(2)} AUD</p>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product.slug, item.quantity - 1)}
                      className="px-3 py-1.5 text-sm hover:bg-gray-100 transition"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.slug, item.quantity + 1)}
                      className="px-3 py-1.5 text-sm hover:bg-gray-100 transition"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.slug)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="font-bold text-lg">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-6 shadow h-fit sticky top-24">
          <h2 className="font-bold text-primary text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm border-b pb-4 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>${totalPrice.toFixed(2)} AUD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>{totalPrice >= 79 ? <span className="text-accent font-medium">FREE</span> : '$9.95 AUD'}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>${(totalPrice + (totalPrice >= 79 ? 0 : 9.95)).toFixed(2)} AUD</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full block">
            Proceed to Checkout
          </Link>
          <Link href="/products" className="block text-center text-sm text-gray-500 hover:text-primary mt-4">
            ← Continue Shopping
          </Link>
          {totalPrice < 79 && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              Add ${(79 - totalPrice).toFixed(2)} more for free shipping!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
