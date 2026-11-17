"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function JpVisitorBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )jp_visitor=([^;]*)/);
    if (m && m[1] === '1') setShow(true);
  }, []);
  if (!show) return null;
  const dismiss = () => {
    document.cookie = 'jp_visitor=0; max-age=31536000; path=/; samesite=lax';
    setShow(false);
  };
  return (
    <div className="bg-[#0f4c3a] text-white text-sm px-4 py-2.5 text-center relative z-50" role="region" aria-label="日本語サイトへの案内">
      🇯🇵 日本からのアクセスを検出しました。
      <Link href="https://jp.freshlocksealer.com/" className="font-bold underline mx-1 hover:text-green-200">日本語サイトはこちら</Link>
      （円表示・国内配送対応）
      <button onClick={dismiss} aria-label="閉じる" className="ml-3 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}
