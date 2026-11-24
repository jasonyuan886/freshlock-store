'use client';

import { useMemo, useState } from 'react';

type OrderRow = {
  file: string; source: string; number: string; created: string;
  total: number | null; currency: string; status: string; email: string;
};
type DayPoint = { date: string; revenue: number; count: number };

const STATUS_STYLE: Record<string, string> = {
  PAID: '#2fb86b', PENDING: '#e8730e', FAILED: '#c0392b', HOLD: '#999',
};

export default function OrdersExplorer({ orders, series }: { orders: OrderRow[]; series: DayPoint[] }) {
  const [status, setStatus] = useState('all');
  const [channel, setChannel] = useState('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => orders.filter(o => {
    if (status !== 'all' && o.status !== status) return false;
    if (channel !== 'all' && o.source !== channel) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!o.number.toLowerCase().includes(s) && !o.email.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [orders, status, channel, q]);

  const paid = filtered.filter(o => o.status === 'PAID');
  const revenue = paid.reduce((s, o) => s + (o.total || 0), 0);

  // ---- SVG 折线图 ----
  const W = 720, H = 190, PAD = 34;
  const maxR = Math.max(1, ...series.map(d => d.revenue));
  const pts = series.map((d, i) => {
    const x = PAD + (i * (W - PAD - 10)) / Math.max(1, series.length - 1);
    const y = H - 24 - (d.revenue / maxR) * (H - 60);
    return { x, y, ...d };
  });
  const line = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `${PAD},${H - 24} ${line} ${pts[pts.length - 1]?.x ?? PAD},${H - 24}`;

  const sel = (v: string, set: (s: string) => void, opts: Array<[string, string]>) => (
    <select value={v} onChange={e => set(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5, background: '#fff' }}>
      {opts.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
    </select>
  );

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 14px' }}>📋 订单看板</h1>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', padding: '16px 16px 8px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>📈 近 30 天已付款收入趋势</span>
          <span style={{ fontSize: 12, color: '#999' }}>峰值 ${maxR.toFixed(2)}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
          {[0.25, 0.5, 0.75, 1].map(f => {
            const y = H - 24 - f * (H - 60);
            return <g key={f}>
              <line x1={PAD} y1={y} x2={W - 10} y2={y} stroke="#f0eee6" strokeWidth="1" />
              <text x={4} y={y + 4} fontSize="9" fill="#bbb">${Math.round(maxR * f)}</text>
            </g>;
          })}
          <polygon points={area} fill="#2fb86b18" />
          <polyline points={line} fill="none" stroke="#2fb86b" strokeWidth="2.2" strokeLinejoin="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.count > 0 ? 3.4 : 1.6} fill={p.count > 0 ? '#2fb86b' : '#ddd'}>
              <title>{`${p.date} — $${p.revenue.toFixed(2)} (${p.count} 笔)`}</title>
            </circle>
          ))}
          {pts.map((p, i) => (i % 5 === 0 ? <text key={i} x={p.x - 12} y={H - 8} fontSize="9" fill="#bbb">{p.date}</text> : null))}
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 14 }}>
        {[
          { icon: '🧾', label: '筛选结果', value: filtered.length },
          { icon: '✅', label: '已付款', value: paid.length },
          { icon: '💰', label: '已付款金额', value: `$${revenue.toFixed(2)}` },
          { icon: '⏳', label: '待付款', value: filtered.filter(o => o.status === 'PENDING').length },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #eceae2' }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {sel(status, setStatus, [['all', '全部状态'], ['PAID', '已付款'], ['PENDING', '待付款'], ['FAILED', '失败']])}
        {sel(channel, setChannel, [['all', '全部渠道'], ['Airwallex', '💳 Airwallex'], ['PayPal', '🅿️ PayPal']])}
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 搜单号 / 邮箱"
          style={{ flex: 1, minWidth: 160, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13.5 }} />
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 620 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#888', fontSize: 12, borderBottom: '1px solid #f0eee6' }}>
              <th style={{ padding: '10px 14px' }}>时间</th><th>单号</th><th>渠道</th><th>邮箱</th><th>金额</th><th>状态</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map(o => (
              <tr key={o.file} style={{ borderBottom: '1px solid #f6f4ee' }}>
                <td style={{ padding: '10px 14px', color: '#666', whiteSpace: 'nowrap' }}>{o.created || '—'}</td>
                <td><a href={`/admin/orders/${encodeURIComponent(o.file.replace(/\.json$/, ''))}`} style={{ color: '#0b6e3b', fontWeight: 600, textDecoration: 'none' }}>{o.number}</a></td>
                <td>{o.source === 'Airwallex' ? '💳 Airwallex' : '🅿️ PayPal'}</td>
                <td style={{ color: '#666' }}>{o.email}</td>
                <td style={{ fontWeight: 700 }}>{o.total != null ? `$${o.total.toFixed(2)}` : '—'}</td>
                <td><span style={{ background: (STATUS_STYLE[o.status] || '#999') + '1a', color: STATUS_STYLE[o.status] || '#666', fontWeight: 700, fontSize: 12, padding: '3px 9px', borderRadius: 999 }}>{o.status}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 26, textAlign: 'center', color: '#999' }}>没有匹配的订单</td></tr>}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: '#aaa', marginTop: 10 }}>显示最近 150 笔中的前 100 条筛选结果 · 数据每 30 秒刷新</p>
    </div>
  );
}
