import { readOrdersJson } from '@/lib/admin-gh';

export const dynamic = 'force-dynamic';

function money(n: any) { return typeof n === 'number' ? `$${n.toFixed(2)}` : '—'; }

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const r = await readOrdersJson(`orders/${decodeURIComponent(params.id)}.json`);
  if (!r) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>😢 订单文件不存在：{params.id}</div>;
  }
  const o: any = r.data;
  const items: any[] = o.items || [];
  const cust = o.customer || {};
  const addr = o.shipping_address || o.shippingAddress || {};
  const isAir = !!o.airwallex_intent_id || o.payment_method === 'airwallex';

  const kv: Array<[string, any]> = [
    ['单号', o.order_number || o.order_id],
    ['渠道', isAir ? '💳 Airwallex' : '🅿️ PayPal'],
    ['状态', o.status],
    ['创建时间', o.created_at],
    ['付款时间', o.paid_at],
    ['邮箱', cust.email || o.customer_email],
    ['姓名', [cust.first_name, cust.last_name].filter(Boolean).join(' ') || o.customer_name],
    ['电话', cust.phone],
    ['地址', [addr.address, addr.city, addr.state, addr.postal_code || addr.postalCode, addr.country].filter(Boolean).join(', ')],
    ['小计', money(o.subtotal)],
    ['运费', money(o.shipping)],
    ['优惠', o.discount ? '-' + money(o.discount) : '—'],
    ['优惠码', o.coupon_code],
    ['合计', (money(o.total) !== '—' ? money(o.total) : '') + ' ' + (o.currency || '')],
  ];

  return (
    <div style={{ maxWidth: 760 }}>
      <a href="/admin" style={{ color: '#0b6e3b', textDecoration: 'none', fontSize: 13 }}>← 返回订单列表</a>
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: '8px 0 16px' }}>🧾 订单详情</h1>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', padding: '18px 18px 6px', marginBottom: 16 }}>
        {kv.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 12, padding: '7px 0', borderBottom: '1px solid #f6f4ee', fontSize: 14 }}>
            <span style={{ width: 90, color: '#888', flexShrink: 0 }}>{k}</span>
            <span style={{ fontWeight: v === o.status ? 700 : 400 }}>{String(v)}</span>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', padding: 18, marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 10px' }}>📦 商品明细</h2>
          {items.map((it: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f6f4ee', fontSize: 14 }}>
              <span>{it.name || it.title} × {it.quantity}</span>
              <span style={{ fontWeight: 600 }}>{money((it.price || it.unit_price || 0) * (it.quantity || 1))}</span>
            </div>
          ))}
        </div>
      )}

      <details style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', padding: '12px 16px', fontSize: 12 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>🔧 原始数据（排障用）</summary>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#666', marginTop: 10 }}>{JSON.stringify(o, null, 2)}</pre>
      </details>
    </div>
  );
}
