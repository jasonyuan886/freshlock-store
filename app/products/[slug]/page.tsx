'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { generateProductSchema } from '@/lib/schema';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return notFound();

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // 添加结构化数据到页面
  useEffect(() => {
    const schema = generateProductSchema(product);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = products.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-primary">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="rounded-xl overflow-hidden bg-white shadow mb-4">
            <img
              src={product.images[selectedImage] || product.image}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    i === selectedImage ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.badge && (
            <span className="inline-block bg-accent/10 text-accent text-sm font-semibold px-3 py-1 rounded-full mb-3">
              {product.badge}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-accent mb-6">
            ${product.price.toFixed(2)}{' '}
            <span className="text-sm text-gray-400 font-normal">AUD</span>
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

          {/* Features */}
          <div className="mb-8">
            <h3 className="font-semibold text-primary mb-3">Key Features</h3>
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-accent mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-lg hover:bg-gray-100 transition"
              >
                −
              </button>
              <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-3 text-lg hover:bg-gray-100 transition"
              >
                +
              </button>
            </div>
            <button onClick={handleAddToCart} className="btn-primary flex-1">
              {added ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
          </div>

          {/* Specs */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-primary mb-3">Specifications</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key}>
                  <dt className="text-gray-500">{key}</dt>
                  <dd className="font-medium text-gray-900">{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-500">
            <span>🚚 Free shipping over $79</span>
            <span>↩️ 30-day returns</span>
            <span>🔒 Secure checkout</span>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="section-title mb-8">You May Also Like</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition flex"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-32 h-32 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-primary mb-1">{p.name}</h3>
                  <p className="text-accent font-bold">${p.price.toFixed(2)} AUD</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
