// 2026-10-30 Kimi: 黑五促销横幅 v2（倒计时版，防御式写法；若构建再失败则回退 .bak_20261030_bfbanner）
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const DEAL_END = new Date('2026-12-01T23:59:59-08:00').getTime();
const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

export default function BlackFridayBanner() {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, DEAL_END - Date.now()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);

  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);

  return (
    <div className="w-full bg-black text-center py-2.5 px-4">
      <Link href="/checkout" className="no-underline">
        <span className="text-yellow-400 font-bold text-sm sm:text-base tracking-wide">
          ⚡ BLACK FRIDAY: 15% OFF — CODE BLACKFRIDAY15
        </span>
        {left > 0 && (
          <span className="ml-2 text-yellow-300 font-bold text-sm sm:text-base">
            ENDS IN {d}D {pad(h)}:{pad(m)}:{pad(s)}
          </span>
        )}
      </Link>
    </div>
  );
}
