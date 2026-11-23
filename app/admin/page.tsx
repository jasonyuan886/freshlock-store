import { listOrdersDir, readOrdersJson } from '@/lib/admin-gh';

export const dynamic = 'force-dynamic';

type Row = {
  file: string;
  source: string;
  number: string;
  created: string;
  total: number | null;
  currency: string;
  status: string;
  email: string;
};

async function loadOrders(): Promise<Row[]> {
  const files = (await listOrdersDir()).map(f => f.name).filter(n => n.endsWith('.json')).sort().reverse().slice(0, 40);
  const rows = await Promise.all(files.map(async (file) => {
    try {
      const r = await readOrdersJson(`orders/${file}`);
      const o: any = r?.data || {};
      const airwallex = !!o.airwallex_intent_id || o.payment_method === 'airwallex';
      return {
        file,
        source: airwallex ? 'Airwallex' : 'PayPal',
        number: o.order_number || o.order_id || file.replace(/\.json$/, ''),
        created: (o.created_at || '').slice(0, 16).replace('T', ' '),
        total: typeof o.total === 'number' ? o.total : (typeof o.amount_total === 'number' ? o.amount_total / 100 : null),
        currency: o.currency || 'USD',
        status: o.status || (o.paid_at ? 'PAID' : 'PENDING'),
        email: o.customer?.email || o.customer_email || o.email || '',
      } as Row;
    } catch {
      return null;
    }
  }));
  return rows.filter(Boolean) as Row[];
}

const STATUS_STYLE: Record<string, string> = {
  PAID: '#2fb86b', SUCCEEDED: '#2fb86b', COMPLETED: '#2fb86b',
  PENDING: '#e8730e', CREATED: '#e8730e',
  FAILED: '#c0392b', CANCELLED: '#c0392b',
};

export default async function AdminDashboard() {
  const orders = await loadOrders();
  const paid = orders.filter(o => ['PAID', 'SUCCEEDED', 'COMPLETED'].includes(o.status));
  const revenue = paid.reduce((s, o) => s + (o.total || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = orders.filter(o => (o.created || '').startsWith(today)).length;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 16px' }}>📋 订单看板</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '🧾', label: '近 40 笔订单', value: orders.length },
          { icon: '✅', label: '已付款', value: paid.length },
          { icon: '💰', label: '已付款总额', value: `$${revenue.toFixed(2)}` },
          { icon: '📅', label: '今日订单', value: todayCount },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 14px', border: '1px solid #eceae2' }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#888', fontSize: 12, borderBottom: '1px solid #f0eee6' }}>
              <th style={{ padding: '10px 14px' }}>时间</th>
              <th>单号</th>
              <th>渠道</th>
              <th>邮箱</th>
              <th>金额</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.file} style={{ borderBottom: '1px solid #f6f4ee' }}>
                <td style={{ padding: '10px 14px', color: '#666', whiteSpace: 'nowrap' }}>{o.created || '—'}</td>
                <td><a href={`/admin/orders/${encodeURIComponent(o.file.replace(/\.json$/, ''))}`} style={{ color: '#0b6e3b', fontWeight: 600, textDecoration: 'none' }}>{o.number}</a></td>
                <td>{o.source === 'Airwallex' ? '💳 Airwallex' : '🅿️ PayPal'}</td>
                <td style={{ color: '#666' }}>{o.email}</td>
                <td style={{ fontWeight: 700 }}>{o.total != null ? `$${o.total.toFixed(2)}` : '—'}</td>
                <td><span style={{ background: (STATUS_STYLE[o.status] || '#999') + '1a', color: STATUS_STYLE[o.status] || '#666', fontWeight: 700, fontSize: 12, padding: '3px 9px', borderRadius: 999 }}>{o.status}</span></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: '#999' }}>暂无订单</td></tr>}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: '#aaa', marginTop: 10 }}>显示最近 40 笔 · 每 30 秒自动刷新缓存</p>
    </div>
  );
}
