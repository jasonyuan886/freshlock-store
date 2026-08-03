'use client';

import { useEffect, useState } from 'react';

export default function FomoStockIndicator({ initialStock = 15 }: { initialStock?: number }) {
  const [mounted, setMounted] = useState(false);
  const [stock, setStock] = useState(initialStock);

  useEffect(() => {
    setMounted(true);
    // Simulate slight stock variation per visit
    setStock(Math.max(5, initialStock - (Math.floor(Math.random() * 4))));
  }, [initialStock]);

  const isLow = stock <= 7;

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 mb-4 text-sm text-green-700">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
        <span className="font-semibold">
          ✓ In stock ({initialStock} available)
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 mb-4 text-sm ${isLow ? 'text-red-600' : 'text-green-700'}`}>
      <span className={`inline-block w-2 h-2 rounded-full ${isLow ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
      <span className="font-semibold">
        {isLow ? `⚠️ Only ${stock} left in stock` : `✓ In stock (${stock} available)`}
      </span>
      {isLow && (
        <span className="text-xs text-gray-500">— order soon!</span>
      )}
    </div>
  );
}
