'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function GalleryClient({
  images,
  name,
  shortDescription,
}: {
  images: string[];
  name: string;
  shortDescription: string;
}) {
  const allImages = images && images.length > 0 ? images : [];
  const [active, setActive] = useState(0);
  if (allImages.length === 0) return null;

  return (
    <section>
      <div className="rounded-xl overflow-hidden bg-white shadow mb-4 relative">
        <Image
          src={allImages[active]}
          alt={`${name} — ${shortDescription}`}
          className="w-full aspect-square object-cover"
          itemProp="image"
          width={800}
          height={800}
          priority
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-3 flex-wrap" role="list" aria-label="Product images">
          {allImages.map((img, i) => (
            <button
              key={i}
              type="button"
              role="listitem"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${allImages.length}`}
              aria-pressed={active === i}
              className={`rounded-lg overflow-hidden border-2 transition ${
                active === i ? 'border-accent ring-2 ring-accent/30' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={img}
                alt={`${name} — view ${i + 1}`}
                className="w-20 h-20 object-cover"
                loading="lazy"
                width={80}
                height={80}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
