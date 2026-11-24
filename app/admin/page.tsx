import { listOrdersDir, readOrdersJson } from '@/lib/admin-gh';
import OrdersExplorer from './OrdersExplorer';

export const dynamic = 'force-dynamic';

export type OrderRow = {
  file: string; source: string; number: string; created: string;
  total: number | null; currency: string; status: string; email: string;
};

const PAID = ['PAID', 'SUCCEEDED', 'COMPLETED'];

async function loadOrders(): Promise<OrderRow[]> {
  const files = (await listOrdersDir()).map(f => f.name).filter(n => n.endsWith('.json')).sort().reverse().slice(0, 150);
  const rows = await Promise.all(files.map(async (file) => {
    try {
      const r = await readOrdersJson(`orders/${file}`);
      const o: any = r?.data || {};
      const airwallex = !!o.airwallex_intent_id || o.payment_method === 'airwallex';
      const total = typeof o.total === 'number' ? o.total : (typeof o.amount_total === 'number' ? o.amount_total / 100 : null);
      let status = o.status || (o.paid_at ? 'PAID' : 'PENDING');
      if (o.qa_hold) status = 'HOLD';  // 疑似测试单，袁总终审前不计入成交
      return {
        file,
        source: airwallex ? 'Airwallex' : 'PayPal',
        number: o.order_number || o.order_id || file.replace(/\.json$/, ''),
        created: (o.created_at || '').slice(0, 16).replace('T', ' '),
        total,
        currency: o.currency || 'USD',
        status: PAID.includes(status) ? 'PAID' : (status === 'PENDING' || status === 'CREATED' ? 'PENDING' : 'FAILED'),
        email: o.customer?.email || o.customer_email || o.email || '',
      } as OrderRow;
    } catch { return null; }
  }));
  return rows.filter(Boolean) as OrderRow[];
}

export default async function AdminDashboard() {
  const orders = await loadOrders();

  // 近 30 天每日已付款收入序列（折线图数据源）
  const days: Record<string, { revenue: number; count: number }> = {};
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    days[d.toISOString().slice(0, 10)] = { revenue: 0, count: 0 };
  }
  for (const o of orders) {
    if (o.status !== 'PAID' || o.total == null) continue;
    const day = (o.created || '').slice(0, 10);
    if (days[day]) { days[day].revenue += o.total; days[day].count += 1; }
  }
  const series = Object.entries(days).map(([date, v]) => ({ date: date.slice(5), revenue: +v.revenue.toFixed(2), count: v.count }));

  return <OrdersExplorer orders={orders} series={series} />;
}
