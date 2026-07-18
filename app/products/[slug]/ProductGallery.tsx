'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
  images: string[];
  productName: string;
  shortDescription: string;
};

export default function ProductGallery({ images, productName, shortDescription }: Props) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (!images || images.length === 0) return null;

  return (
    <section>
      <div
        className="rounded-xl overflow-hidden bg-white shadow mb-4 cursor-zoom-in"
        onClick={() => setZoom(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setZoom(true); }}
        aria-label={`View larger image of ${productName}`}
      >
        <Image
          src={images[active]}
          alt={`${productName} — ${shortDescription}`}
          className="w-full aspect-square object-cover transition-opacity duration-200"
          width={600}
          height={600}
          priority={active === 0}
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3" role="list" aria-label="Product image thumbnails">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              role="listitem"
              onClick={() => setActive(i)}
              className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                i === active ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-gray-300'
              }`}
              aria-label={`View image ${i + 1} of ${images.length}`}
              aria-pressed={i === active}
            >
              <Image
                src={img}
                alt={`${productName} — view ${i + 1}`}
                className="w-full h-full object-cover"
                width={80}
                height={80}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Product image zoom"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom(false);
            }}
            className="absolute top-4 right-4 text-white text-3xl w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Close"
          >
            ×
          </button>
          <Image
            src={images[active]}
            alt={`${productName} — ${shortDescription}`}
            className="max-w-full max-h-[90vh] object-contain"
            width={1200}
            height={1200}
            onClick={(e) => e.stopPropagation()}
            priority
          />
        </div>
      )}
    </section>
  );
}
