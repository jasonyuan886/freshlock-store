// 2026-11-06 22:40 Kimi: 袁总令——直接通知黑五开始，不要多余的（倒计时砍掉）。
// 保留一键复制券码按钮（22:35 修复：链接吞复制的问题）。
'use client';

import Link from 'next/link';
import { useState } from 'react';

const CODE = 'BLACKFRIDAY10';

export default function BlackFridayBanner() {
  const [copied, setCopied] = useState(false);

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

  return (
    <div id="bf-banner" className="w-full bg-black text-center py-2.5 px-4">
      <Link href="/checkout" className="no-underline">
        <span className="text-yellow-400 font-bold text-sm sm:text-base tracking-wide">
          ⚡ BLACK FRIDAY IS ON — $10 OFF
        </span>
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
