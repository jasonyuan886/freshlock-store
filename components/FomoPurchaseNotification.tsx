'use client';

import { useEffect, useState, useRef } from 'react';

// Real customer reviews from product page (verified buyers)
const reviews = [
  { name: 'Sarah M.', rating: 5, text: 'Absolutely love my FreshLock Pro! No more freezer burn on my ground beef. Game changer for meal prep.', product: 'FreshLock Pro' },
  { name: 'James T.', rating: 5, text: 'Bought the Starter Kit as a gift — she uses it every single day. Even I can figure it out!', product: 'Starter Kit' },
  { name: 'Priya K.', rating: 4, text: 'Works great for sous-vide — the seal is solid every time and quieter than I expected.', product: 'FreshLock Pro' },
  { name: 'Emma W.', rating: 5, text: 'Our household food waste is down by at least half. Love that I can use other brands of bags too.', product: 'FreshLock Pro' },
  { name: 'Michael R.', rating: 4, text: 'Solid build quality and USB-C charging is really convenient. Battery lasts for weeks.', product: 'FreshLock Pro' },
  { name: 'Linda C.', rating: 5, text: 'The drip tray is the real unsung hero. No liquid getting sucked into the motor.', product: 'FreshLock Pro' },
  { name: 'David P.', rating: 5, text: 'Used it on a camping trip to seal marinated steaks — zero leaks in the cooler.', product: 'FreshLock Pro' },
];

function Stars({ rating }: { rating: number }) {
  return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
}

export default function FomoPurchaseNotification() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<(typeof reviews)[0] | null>(null);
  const [closed, setClosed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (closed) return;

    const showNotification = () => {
      const random = reviews[Math.floor(Math.random() * reviews.length)];
      setCurrent(random);
      setVisible(true);

      timerRef.current = setTimeout(() => {
        setVisible(false);
        timerRef.current = setTimeout(showNotification, 25000 + Math.random() * 25000);
      }, 6000);
    };

    const initialTimer = setTimeout(showNotification, 10000 + Math.random() * 8000);
    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [closed]);

  if (closed || !current) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 max-w-xs transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4">
        <button
          onClick={() => setClosed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm leading-none"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="flex items-start gap-3 pr-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
            {current.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs" aria-label={`${current.rating} out of 5 stars`}>
                <Stars rating={current.rating} />
              </span>
              <span className="text-xs text-green-600 font-medium">✓ Verified Buyer</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">{current.name}</p>
            <p className="text-xs text-gray-600 leading-snug line-clamp-3">"{current.text}"</p>
            <p className="text-[10px] text-gray-400 mt-1.5">on {current.product}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
