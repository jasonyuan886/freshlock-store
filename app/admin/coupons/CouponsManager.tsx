'use client';

import { useState } from 'react';

type Coupon = { code: string; percentOff?: number; amountOff?: number; minSubtotal?: number; active: boolean; notBefore?: string; notAfter?: string; description: string };

type Template = 'percent' | 'amount' | 'threshold';

const TEMPLATES: Array<{ key: Template; icon: string; name: string; hint: string }> = [
  { key: 'percent', icon: '📊', name: '百分比折扣', hint: '如 15% off——填一个数字就行' },
  { key: 'amount', icon: '💵', name: '固定金额立减', hint: '如立减 $10——填一个数字' },
  { key: 'threshold', icon: '🎯', name: '满额立减', hint: '如满 $39 减 $10——填两个数字' },
];

export default function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const [rows, setRows] = useState<Coupon[]>(coupons);
  const [tpl, setTpl] = useState<Template>('percent');
  const [form, setForm] = useState({ code: '', percent: '', amount: '', threshold: '', notBefore: '', notAfter: '', description: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function call(action: string, extra: any = {}) {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...extra }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { setRows(d.coupons); setMsg('✅ 已保存，2 分钟内生效'); return true; }
      setMsg('❌ ' + (d.error || '失败'));
      return false;
    } catch { setMsg('❌ 网络错误'); return false; }
    finally { setBusy(false); }
  }

  function createPayload() {
    const code = form.code.trim().toUpperCase();
    if (tpl === 'percent') {
      const pct = Number(form.percent);
      if (!form.percent || !(pct > 0 && pct < 100)) return { error: '填 1-99 的折扣数字（如 15 = 15%）' };
      return { code, percentOff: pct / 100, notBefore: form.notBefore || undefined, notAfter: form.notAfter || undefined, description: form.description || `${pct}% off promo` };
    }
    if (tpl === 'amount') {
      const amt = Number(form.amount);
      if (!form.amount || !(amt > 0)) return { error: '填立减金额（如 10）' };
      return { code, amountOff: amt, notBefore: form.notBefore || undefined, notAfter: form.notAfter || undefined, description: form.description || `$${amt} off promo` };
    }
    const amt = Number(form.amount); const th = Number(form.threshold);
    if (!form.amount || !(amt > 0)) return { error: '填立减金额' };
    if (!form.threshold || !(th > 0)) return { error: '填满额门槛（如 39）' };
    return { code, amountOff: amt, minSubtotal: th, notBefore: form.notBefore || undefined, notAfter: form.notAfter || undefined, description: form.description || `$${amt} off over $${th}` };
  }

  const today = new Date().toISOString().slice(0, 10);
  const inp: React.CSSProperties = { padding: '9px 11px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5, width: '100%', boxSizing: 'border-box' };

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
                  <td style={{ color: '#666' }}>{c.minSubtotal ? `满 $${c.minSubtotal} · ` : ''}{c.notBefore || '…'} ~ {c.notAfter || '长期'}</td>
                  <td style={{ color: '#888', fontSize: 12 }}>{c.description}</td>
                  <td><span style={{ fontWeight: 700, fontSize: 12, color: !c.active ? '#999' : expired ? '#c0392b' : notYet ? '#e8730e' : '#2fb86b' }}>{!c.active ? '已停用' : expired ? '已过期' : notYet ? '未开始' : '生效中'}</span></td>
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {TEMPLATES.map(t => (
            <button key={t.key} onClick={() => setTpl(t.key)} disabled={busy}
              style={{ padding: '10px 14px', borderRadius: 10, border: tpl === t.key ? '2px solid #2fb86b' : '1.5px solid #ddd', background: tpl === t.key ? '#f0faf4' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.icon} {t.name}</div>
              <div style={{ fontSize: 11.5, color: '#999' }}>{t.hint}</div>
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>代码名（如 SUMMER20）</div>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="SUMMER20" style={inp} />
          </div>
          {tpl === 'percent' && (
            <div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>折扣 %（填 15 = 85 折）</div>
              <input type="number" value={form.percent} onChange={e => setForm(f => ({ ...f, percent: e.target.value }))} placeholder="15" style={inp} />
            </div>
          )}
          {tpl !== 'percent' && (
            <div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>立减金额 $</div>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="10" style={inp} />
            </div>
          )}
          {tpl === 'threshold' && (
            <div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>满额门槛 $</div>
              <input type="number" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} placeholder="39" style={inp} />
            </div>
          )}
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>开始日（可空）</div>
            <input value={form.notBefore} onChange={e => setForm(f => ({ ...f, notBefore: e.target.value }))} placeholder="2026-12-01" style={inp} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>结束日（可空）</div>
            <input value={form.notAfter} onChange={e => setForm(f => ({ ...f, notAfter: e.target.value }))} placeholder="2026-12-26" style={inp} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>备注（可空）</div>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="黑五活动" style={inp} />
          </div>
        </div>
        <button disabled={busy} onClick={async () => {
          const payload = createPayload();
          if ((payload as any).error) { setMsg('❌ ' + (payload as any).error); return; }
          const ok = await call('create', payload);
          if (ok) setForm({ code: '', percent: '', amount: '', threshold: '', notBefore: '', notAfter: '', description: '' });
        }} style={{ marginTop: 12, padding: '10px 22px', borderRadius: 8, border: 'none', background: '#2fb86b', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          🚀 创建
        </button>
        {msg && <p style={{ fontSize: 13, margin: '10px 0 0' }}>{msg}</p>}
      </div>
    </div>
  );
}
