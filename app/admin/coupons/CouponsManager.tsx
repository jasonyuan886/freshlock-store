'use client';

import { useState } from 'react';

type Coupon = { code: string; percentOff?: number; amountOff?: number; minSubtotal?: number; active: boolean; notBefore?: string; notAfter?: string; description: string };

export default function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const [rows, setRows] = useState<Coupon[]>(coupons);
  const [form, setForm] = useState({ code: '', percentOff: '', amountOff: '', minSubtotal: '', notBefore: '', notAfter: '', description: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function call(action: string, extra: any = {}) {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { setRows(d.coupons); setMsg('✅ 已保存，2 分钟内生效'); return true; }
      setMsg('❌ ' + (d.error || '失败'));
      return false;
    } catch { setMsg('❌ 网络错误'); return false; }
    finally { setBusy(false); }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#888', fontSize: 12, borderBottom: '1px solid #f0eee6' }}>
              <th style={{ padding: '10px 14px' }}>代码</th><th>力度</th><th>门槛/有效期</th><th>说明</th><th>状态</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => {
              const expired = c.notAfter && today >= c.notAfter;
              const notYet = c.notBefore && today < c.notBefore;
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f6f4ee' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700 }}>{c.code}</td>
                  <td>{c.percentOff ? `${Math.round(c.percentOff * 100)}% off` : `$${c.amountOff} off`}</td>
                  <td style={{ color: '#666' }}>
                    {c.minSubtotal ? `满 $${c.minSubtotal} · ` : ''}{c.notBefore || '…'} ~ {c.notAfter || '长期'}
                  </td>
                  <td style={{ color: '#888', fontSize: 12 }}>{c.description}</td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 12, color: !c.active ? '#999' : expired ? '#c0392b' : notYet ? '#e8730e' : '#2fb86b' }}>
                      {!c.active ? '已停用' : expired ? '已过期' : notYet ? '未开始' : '生效中'}
                    </span>
                  </td>
                  <td style={{ paddingRight: 14 }}>
                    <button disabled={busy} onClick={() => call('toggle', { index: i })}
                      style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid #2fb86b', background: c.active ? '#fff' : '#2fb86b', color: c.active ? '#0b6e3b' : '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                      {c.active ? '停用' : '启用'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', padding: 18 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 12px' }}>➕ 新建优惠码</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <input placeholder="代码（如 SUMMER20）" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} style={{ padding: '9px 11px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5 }} />
          <input placeholder="折扣率 0-1（0.15=15%）" value={form.percentOff} onChange={e => setForm(f => ({ ...f, percentOff: e.target.value }))} style={{ padding: '9px 11px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5 }} />
          <input placeholder="或立减金额 $" value={form.amountOff} onChange={e => setForm(f => ({ ...f, amountOff: e.target.value }))} style={{ padding: '9px 11px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5 }} />
          <input placeholder="门槛小计$（可空）" value={form.minSubtotal} onChange={e => setForm(f => ({ ...f, minSubtotal: e.target.value }))} style={{ padding: '9px 11px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5 }} />
          <input placeholder="开始日 2026-12-01" value={form.notBefore} onChange={e => setForm(f => ({ ...f, notBefore: e.target.value }))} style={{ padding: '9px 11px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5 }} />
          <input placeholder="结束日 2026-12-26" value={form.notAfter} onChange={e => setForm(f => ({ ...f, notAfter: e.target.value }))} style={{ padding: '9px 11px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5 }} />
          <input placeholder="备注说明" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ padding: '9px 11px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5 }} />
        </div>
        <button disabled={busy} onClick={async () => {
          const ok = await call('create', form);
          if (ok) setForm({ code: '', percentOff: '', amountOff: '', minSubtotal: '', notBefore: '', notAfter: '', description: '' });
        }} style={{ marginTop: 12, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#2fb86b', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          🚀 创建
        </button>
        {msg && <p style={{ fontSize: 13, margin: '10px 0 0' }}>{msg}</p>}
      </div>
    </div>
  );
}
