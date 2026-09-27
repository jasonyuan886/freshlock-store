'use client';

import { useState } from 'react';
import Image from 'next/image';
import { trackAddToCart } from '@/lib/ga4';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import type { Product } from '@/lib/types';

type BundleItem = {
  product: Product;
  selected: boolean;
  discount?: number; // percent off when bought together
};

export default function FrequentlyBoughtTogether({
  mainProduct,
  bundleProducts,
  discountPercent = 10,
}: {
  mainProduct: Product;
  bundleProducts: Product[];
  discountPercent?: number;
}) {
  const { addToCart } = useCart();
  const [items, setItems] = useState<BundleItem[]>(
    bundleProducts.map((p) => ({ product: p, selected: true, discount: discountPercent }))
  );
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const toggleItem = (idx: number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, selected: !it.selected } : it)));
  };

  const selectedItems = items.filter((it) => it.selected);
  const bundleTotal = [mainProduct, ...selectedItems.map((it) => it.product)].reduce(
    (sum, p) => sum + p.price,
    0
  );
  const savings = selectedItems.reduce((sum, it) => sum + it.product.price * (it.discount ?? 0) / 100, 0);
  const finalPrice = bundleTotal - savings;

  const handleAddAll = async () => {
    setAdding(true);
    // 2026-09-27: 这里原来只调 addToCart，**没有发 GA4 的 add_to_cart 事件**，
    // 于是通过"常一起购买"组合加购的行为在 GA4 里完全看不见。
    // 症状是漏斗出现了不可能的数字：近14天 begin_checkout(7) 反而多于 add_to_cart(6)
    // ——有人没加购就结账了。真相是他们从这个组件加的购，只是没被记录。
    // 后果不只是数字难看：加购率是判断产品页好不好的主要依据，这个口径缺了一块，
    // 就会把"组件其实有效"误判成"产品页转化差"，进而改错地方。
    addToCart(mainProduct, 1);
    trackAddToCart(mainProduct, 1);
    for (const it of selectedItems) {
      addToCart(it.product, 1);
      trackAddToCart(it.product, 1);
    }
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <section className="mt-12 border-t pt-10" aria-labelledby="fbt-heading">
      <h2 id="fbt-heading" className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
        🛒 Frequently bought together
      </h2>

      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-5 border border-primary/10">
        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          {/* Items row */}
          <div className="flex-1 flex flex-col sm:flex-row items-start gap-3 flex-wrap">
            {/* Main product */}
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                <Image
                  src={mainProduct.image}
                  alt={mainProduct.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div>
                <Link href={`/products/${mainProduct.slug}`} className="font-semibold text-sm text-primary hover:underline line-clamp-2">
                  {mainProduct.name}
                </Link>
                <p className="text-accent font-bold text-sm mt-1">${mainProduct.price.toFixed(2)}</p>
              </div>
            </div>

            {selectedItems.length > 0 && <span className="text-2xl text-gray-400 hidden sm:block self-center">+</span>}

            {items.map((it, idx) => (
              <div key={it.product.slug} className="flex items-center gap-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={it.selected}
                    onChange={() => toggleItem(idx)}
                    className="mt-1.5 accent-primary w-4 h-4"
                  />
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                    <Image
                      src={it.product.image}
                      alt={it.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div>
                    <Link href={`/products/${it.product.slug}`} className="font-semibold text-sm text-gray-800 hover:underline line-clamp-2">
                      {it.product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-accent font-bold text-sm">${it.product.price.toFixed(2)}</span>
                      {it.discount ? (
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold">
                          -{it.discount}% bundle
                        </span>
                      ) : null}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>

          {/* Price + CTA column */}
          <div className="sm:w-56 flex flex-col justify-between gap-3 pt-3 sm:pt-0 sm:border-l sm:pl-4">
            <div>
              {savings > 0 ? (
                <p className="text-xs text-green-700 font-semibold mb-1">
                  💰 Bundle price: <span className="line-through text-gray-400 font-normal">${bundleTotal.toFixed(2)}</span>
                </p>
              ) : null}
              <p className="text-2xl font-bold text-primary">
                ${finalPrice.toFixed(2)}
              </p>
              {savings > 0 ? (
                <p className="text-xs text-green-700 mt-0.5">You save ${savings.toFixed(2)}</p>
              ) : null}
            </div>
            <button
              onClick={handleAddAll}
              disabled={adding || added}
              className="btn-primary w-full text-sm py-3 disabled:opacity-70"
            >
              {added ? '✓ Added to cart!' : adding ? 'Adding...' : `Add all ${1 + selectedItems.length} to cart`}
            </button>
            <p className="text-[11px] text-gray-500 text-center leading-tight">
              Ships free if total over $89 · 30-day returns
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
