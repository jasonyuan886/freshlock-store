// 2026-10-30 Kimi: 黑五促销横幅 v2（倒计时版，防御式写法）
// 2026-11-06 22:35 Kimi: 加一键复制券码按钮（袁总实测反馈：码复制不了——
// 旧版纯文本裹在 <Link> 里，手机长按被链接吃掉；新版按钮独立于链接 +
// clipboard API + execCommand 兜底）；倒计时保持两阶段（开闸后数到 12-01 结束）。
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const CODE = 'BLACKFRIDAY10';
const DEAL_START = new Date('2026-11-06T06:00:00-08:00').getTime(); // 袁总令 11-06 提前开闸
const DEAL_END = new Date('2026-12-01T23:59:59-08:00').getTime();
const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

export default function BlackFridayBanner() {
  const [now, setNow] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = CODE;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

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
            {started ? 'ENDS IN' : 'STARTS IN'} {d}D {pad(h)}:{pad(m)}:{pad(s)}
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={copyCode}
        aria-label="Copy coupon code"
        className="ml-2 align-middle bg-yellow-400 text-black text-xs sm:text-sm font-bold px-2.5 py-1 rounded"
      >
        {copied ? 'COPIED!' : (<span>COPY CODE <span className="hidden sm:inline">{CODE}</span></span>)}
      </button>
    </div>
  );
}
