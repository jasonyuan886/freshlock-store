'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import type { Product } from '@/lib/types';

export default function AddToCartClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
      <div className="flex items-center border rounded-lg self-start sm:self-auto" role="group" aria-label="Quantity selector">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-11 h-11 flex items-center justify-center text-lg hover:bg-gray-100 transition rounded-l-lg"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="px-4 font-semibold min-w-[3rem] text-center" aria-live="polite">{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="w-11 h-11 flex items-center justify-center text-lg hover:bg-gray-100 transition rounded-r-lg"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button onClick={handleAddToCart} className="btn-primary flex-1 w-full sm:w-auto px-6 text-base" aria-live="polite">
        {added ? '✓ Added to Cart!' : 'Add to Cart'}
      </button>
    </div>
  );
}
