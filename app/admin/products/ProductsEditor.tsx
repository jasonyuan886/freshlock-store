'use client';

import { useState } from 'react';

type Row = {
  slug: string; name: string; price: number; compareAt: number | null;
  priceOverride: number | null; capOverride: number | null;
  image: string; mainImgOverride: string | null;
  gallery: string[]; galleryOverrides: Record<string, string>;
};

export default function ProductsEditor({ rows }: { rows: Row[] }) {
  const [prices, setPrices] = useState<Record<string, string>>(Object.fromEntries(rows.map(r => [r.slug, r.priceOverride != null ? String(r.priceOverride) : ''])));
  const [caps, setCaps] = useState<Record<string, string>>(Object.fromEntries(rows.map(r => [r.slug, r.capOverride != null ? String(r.capOverride) : ''])));
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function post(url: string, payload: any): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await res.json().catch(() => ({}));
      return { ok: res.ok, error: d.error };
    } catch { return { ok: false, error: '网络错误' }; }
  }

  async function savePrice(slug: string) {
    setBusy(slug); setMsg(m => ({ ...m, [slug]: '' }));
    const p = prices[slug]?.trim();
    const c = caps[slug]?.trim();
    const r = await post('/api/admin/products/price', { slug, price: p === '' ? null : p, compareAtPrice: c === '' ? null : c });
    setMsg(m => ({ ...m, [slug]: r.ok ? '✅ 已保存，2 分钟内生效（清空两项=恢复原价）' : '❌ ' + (r.error || '失败') }));
    setBusy(null);
  }

  async function upload(slug: string, slot: string, file: File) {
    setBusy(slug); setMsg(m => ({ ...m, [slug]: '' }));
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader(); fr.onload = () => resolve(String(fr.result)); fr.onerror = reject; fr.readAsDataURL(file);
    });
    const r = await post('/api/admin/products/image', { slug, slot, dataUrl });
    setMsg(m => ({ ...m, [slug]: r.ok ? `✅ 图片已更新（${slot === 'main' ? '主图' : '画廊第' + (Number(slot) + 1) + '张' }）` : '❌ ' + (r.error || '失败') }));
    setBusy(null);
  }

  const pick = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
  );

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {rows.map(r => {
        const galleryCount = Math.max(r.gallery.length, 1);
        return (
          <div key={r.slug} style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.mainImgOverride || r.image} alt={r.name} style={{ width: 74, height: 74, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #2fb86b' }} />
                <label title="更换主图" style={{ position: 'absolute', right: -6, bottom: -6, background: '#2fb86b', color: '#fff', borderRadius: 999, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {pick}
                  <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(r.slug, 'main', f); e.target.value = ''; }} />
                </label>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: '#999', margin: '2px 0 8px' }}>
                  /{r.slug} ｜ 现价 ${r.price.toFixed(2)}{r.compareAt ? ` ｜ 划线 $${r.compareAt.toFixed(2)}` : ''}
                  {r.priceOverride != null ? ' ｜ 已覆盖' : ''}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: 12, color: '#888' }}>💰 价格 $</label>
                  <input type="number" step="0.01" value={prices[r.slug] ?? ''} placeholder={String(r.price)}
                    onChange={e => setPrices(p => ({ ...p, [r.slug]: e.target.value }))}
                    style={{ width: 84, padding: '7px 9px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5 }} />
                  <label style={{ fontSize: 12, color: '#888' }}>划线 $</label>
                  <input type="number" step="0.01" value={caps[r.slug] ?? ''} placeholder={r.compareAt ? String(r.compareAt) : '原价'}
                    onChange={e => setCaps(p => ({ ...p, [r.slug]: e.target.value }))}
                    style={{ width: 84, padding: '7px 9px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5 }} />
                  <button onClick={() => savePrice(r.slug)} disabled={busy === r.slug}
                    style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#2fb86b', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    保存价格
                  </button>
                </div>
                {msg[r.slug] && <div style={{ fontSize: 12.5, marginTop: 6 }}>{msg[r.slug]}</div>}
              </div>
            </div>
            <div style={{ marginTop: 12, borderTop: '1px dashed #eee', paddingTop: 10 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>🖼️ 产品画廊（共 {galleryCount} 张，点图标逐张更换）</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {r.gallery.map((g, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.galleryOverrides[String(i)] || g} alt={`${r.name}-${i + 1}`} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e5e5' }} />
                    <label title={`更换第 ${i + 1} 张`} style={{ position: 'absolute', right: -5, bottom: -5, background: '#fff', color: '#0b6e3b', border: '1.5px solid #2fb86b', borderRadius: 999, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      {pick}
                      <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(r.slug, String(i), f); e.target.value = ''; }} />
                    </label>
                  </div>
                ))}
                {r.gallery.length === 0 && <span style={{ fontSize: 12, color: '#bbb' }}>此产品无画廊图</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
