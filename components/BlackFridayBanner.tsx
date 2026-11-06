// 2026-10-30 Kimi: 黑五促销横幅 v2（倒计时版，防御式写法；若构建再失败则回退 .bak_20261030_bfbanner）
// 2026-11-06 Kimi: 两阶段倒计时——黑五前数到「开始」(11-24 PT)，黑五中数到「结束」(12-01 PT)，
// 短主文案保移动端单行比例；固定金额券 BLACKFRIDAY10 替换已停用的折扣券 BLACKFRIDAY15。
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const DEAL_START = new Date('2026-11-24T00:00:00-08:00').getTime();
const DEAL_END = new Date('2026-12-01T23:59:59-08:00').getTime();
const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

export default function BlackFridayBanner() {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);

  const started = now >= DEAL_START;
  const target = started ? DEAL_END : DEAL_START;
  const left = Math.max(0, target - now);
  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);

  return (
    <div id="bf-banner" className="w-full bg-black text-center py-2.5 px-4">
      <Link href="/checkout" className="no-underline">
        <span className="text-yellow-400 font-bold text-sm sm:text-base tracking-wide">
          ⚡ BLACK FRIDAY: $10 OFF
        </span>
        {now > 0 && (
          <span className="ml-2 text-yellow-300 font-bold text-sm sm:text-base">
            {started ? 'ENDS IN' : 'STARTS IN'} {d}D {pad(h)}:{pad(m)}:{pad(s)} · CODE BLACKFRIDAY10
          </span>
        )}
      </Link>
    </div>
  );
}
