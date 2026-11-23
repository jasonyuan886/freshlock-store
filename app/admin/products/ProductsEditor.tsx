'use client';

import { useState } from 'react';

type Row = {
  slug: string; name: string; basePrice: number | null; price: number;
  hasOverride: boolean; image: string; imageOverride: string | null;
};

export default function ProductsEditor({ rows }: { rows: Row[] }) {
  const [prices, setPrices] = useState<Record<string, string>>(Object.fromEntries(rows.map(r => [r.slug, r.hasOverride ? String(r.price) : '' ])));
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function savePrice(slug: string) {
    const raw = prices[slug]?.trim();
    setBusy(slug);
    setMsg(m => ({ ...m, [slug]: '' }));
    try {
      const res = await fetch('/api/admin/products/price', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, price: raw === '' ? null : Number(raw) }),
      });
      const d = await res.json().catch(() => ({}));
      setMsg(m => ({ ...m, [slug]: res.ok ? (raw === '' ? '✅ 已恢复原价' : '✅ 已保存，2 分钟内生效') : '❌ ' + (d.error || '失败') }));
    } catch {
      setMsg(m => ({ ...m, [slug]: '❌ 网络错误' }));
    } finally { setBusy(null); }
  }

  async function uploadImage(slug: string, file: File) {
    setBusy(slug);
    setMsg(m => ({ ...m, [slug]: '' }));
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
      const res = await fetch('/api/admin/products/image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, dataUrl }),
      });
      const d = await res.json().catch(() => ({}));
      setMsg(m => ({ ...m, [slug]: res.ok ? '✅ 图片已更新，数分钟内生效' : '❌ ' + (d.error || '失败') }));
    } catch {
      setMsg(m => ({ ...m, [slug]: '❌ 上传失败' }));
    } finally { setBusy(null); }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {rows.map(r => (
        <div key={r.slug} style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.imageOverride || r.image} alt={r.name} style={{ width: 62, height: 62, objectFit: 'cover', borderRadius: 10, border: '1px solid #eee' }} />
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>/{r.slug} ｜ 现价 ${r.price.toFixed(2)}{r.hasOverride ? ' （已覆盖）' : ''}</div>
            {msg[r.slug] && <div style={{ fontSize: 12.5, marginTop: 4 }}>{msg[r.slug]}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 12, color: '#888' }}>💰 新价格 $</label>
            <input
              type="number" step="0.01" min="0.5"
              value={prices[r.slug] ?? ''}
              placeholder={String(r.price)}
              onChange={e => setPrices(p => ({ ...p, [r.slug]: e.target.value }))}
              style={{ width: 92, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 14 }}
            />
            <button onClick={() => savePrice(r.slug)} disabled={busy === r.slug}
              style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#2fb86b', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              保存
            </button>
            <label style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #2fb86b', color: '#0b6e3b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              🖼️ 换图
              <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(r.slug, f); e.target.value = ''; }} />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
