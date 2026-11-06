// 2026-11-06 22:42 Kimi: 袁总定稿——直接通知黑五开始（不多余的话）+ 保留倒计时（数到 12-01 结束）
// + 一键复制券码按钮（22:35 修复：链接吞复制的问题）。两阶段逻辑已删（活动已开，无「开始」态）。
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const CODE = 'BLACKFRIDAY10';
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

  const left = Math.max(0, DEAL_END - now);
  const d_ = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);

  return (
    <div id="bf-banner" className="w-full bg-black text-center py-2.5 px-4">
      <Link href="/checkout" className="no-underline">
        <span className="text-yellow-400 font-bold text-sm sm:text-base tracking-wide">
          ⚡ BLACK FRIDAY IS ON — $10 OFF
        </span>
        {now > 0 && (
          <span className="ml-2 text-yellow-300 font-bold text-sm sm:text-base">
            ENDS IN {d_}D {pad(h)}:{pad(m)}:{pad(s)}
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
