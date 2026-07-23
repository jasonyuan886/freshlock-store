'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { products } from '@/lib/data';
import type { Product } from '@/lib/types';

type BundleOption = {
  id: string;
  bags: Product;
  label: string;
};

export default function BundleAddons({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  // Only show on freshlock-pro and bag product pages
  const bagProducts = products.filter((p) => p.category === 'bags');
  const sealer = products.find((p) => p.slug === 'freshlock-pro');

  let bundles: BundleOption[] = [];

  if (product.slug === 'freshlock-pro') {
    // On sealer page: show bundle options for all bag sizes
    bundles = bagProducts.map((bags) => ({
      id: `pro-${bags.slug}`,
      bags,
      label: bags.slug === 'vacuum-seal-bags-25-pack'
        ? 'Try it out — Pro + 25 small bags'
        : bags.slug === 'vacuum-seal-bags-30-pack'
        ? 'Everyday use — Pro + 30 medium bags'
        : 'Best value — Pro + 50 large bags',
    }));
  } else if (product.category === 'bags' && sealer) {
    // On a bag page: show "add the sealer" bundle
    bundles = [{
      id: `sealer-${product.slug}`,
      bags: product,
      label: 'Get the sealer too — complete your setup',
    }];
    // Override: show sealer as the add-on item
  } else {
    return null;
  }

  const handleAddBundle = (bundle: BundleOption) => {
    if (product.slug === 'freshlock-pro') {
      addToCart(product, 1);
      addToCart(bundle.bags, 1);
    } else {
      // On bag page, add sealer + this bag
      addToCart(sealer!, 1);
      addToCart(product, 1);
    }
    setAddedId(bundle.id);
    setTimeout(() => setAddedId(null), 2500);
  };

  // For bags pages, show sealer bundle
  if (product.category === 'bags' && sealer) {
    const bundleTotal = sealer.price + product.price;
    const qualifiesFree = bundleTotal >= 99;
    const isAdded = addedId === `sealer-${product.slug}`;
    return (
      <section aria-label="Bundle offer" className="bg-accent/5 border border-accent/10 rounded-xl p-4 sm:p-5 mb-4">
        <h3 className="font-semibold text-base text-primary mb-3 flex items-center gap-2">
          🎁 <span>Bundle & Save on Shipping</span>
        </h3>
        <div className="flex gap-3 sm:gap-4 items-center mb-3">
          <div className="flex -space-x-3 flex-shrink-0">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-white">
              <Image src={sealer.image} alt={sealer.name} fill className="object-cover" sizes="80px" />
            </div>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-white">
              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="80px" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">
              FreshLock Pro + {product.name.split('—')[1]?.trim() || product.name}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              {qualifiesFree ? (
                <>Qualifies for <span className="text-accent font-semibold">FREE shipping!</span></>
              ) : (
                <>Add A${(99 - bundleTotal).toFixed(2)} more for FREE shipping</>
              )}
            </p>
            <p className="mt-1">
              <span className="text-accent font-bold text-base sm:text-lg">A${bundleTotal.toFixed(2)}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleAddBundle({ id: `sealer-${product.slug}`, bags: product, label: '' })}
          className="btn-primary w-full text-sm sm:text-base min-h-[44px]"
          aria-live="polite"
        >
          {isAdded ? '✓ Both added to cart!' : 'Add Both to Cart'}
        </button>
      </section>
    );
  }

  // For sealer page, show multiple bundle options
  return (
    <section aria-label="Bundle offers" className="bg-accent/5 border border-accent/10 rounded-xl p-4 sm:p-5 mb-4">
      <h3 className="font-semibold text-base text-primary mb-3 flex items-center gap-2">
        🎁 <span>Bundle & Save on Shipping</span>
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-3">
        Add bags to your order and unlock <span className="text-accent font-semibold">FREE shipping</span> (orders over A$99)
      </p>
      <div className="space-y-3">
        {bundles.map((bundle) => {
          const bundleTotal = product.price + bundle.bags.price;
          const qualifiesFree = bundleTotal >= 99;
          const isAdded = addedId === bundle.id;
          return (
            <div key={bundle.id} className="flex gap-3 items-center">
              <div className="flex -space-x-3 flex-shrink-0">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-white">
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-white">
                  <Image src={bundle.bags.image} alt={bundle.bags.name} fill className="object-cover" sizes="64px" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 leading-snug">{bundle.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="text-accent font-bold text-sm">A${bundleTotal.toFixed(2)}</span>
                  {qualifiesFree && <span className="ml-2 text-green-600 font-medium">✓ FREE shipping</span>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddBundle(bundle)}
                className="btn-primary text-xs sm:text-sm px-3 py-2 min-h-[40px] whitespace-nowrap flex-shrink-0"
                aria-live="polite"
              >
                {isAdded ? '✓ Added!' : 'Add'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
