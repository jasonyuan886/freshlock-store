// 2026-10-30 Kimi: 黑五促销横幅（带实时倒计时，11-24 至 12-01，结束后删此组件与 layout 引用）
'use client';

import { useEffect, useState } from 'react';

const DEAL_END = new Date('2026-12-01T23:59:59-08:00').getTime();

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export default function BlackFridayBanner() {
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const left = Math.max(0, DEAL_END - now);
  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);

  return (
    <a
      href="/checkout"
      className="block w-full bg-black text-center py-2.5 px-4 no-underline"
      aria-label="Black Friday deal"
    >
      <span className="text-yellow-400 font-bold text-sm sm:text-base tracking-wide">
        ⚡ BLACK FRIDAY: 30% OFF — CODE BLACKFRIDAY30
        {now > 0 && (
          <span className="ml-2 text-yellow-300">
            ENDS IN {d}D {pad(h)}:{pad(m)}:{pad(s)}
          </span>
        )}
      </span>
    </a>
  );
}
