import couponsData from '@/data/coupons.json';
import CouponsManager from './CouponsManager';

export const dynamic = 'force-dynamic';

export default function AdminCouponsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 6px' }}>🏷️ 折扣管理</h1>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 16px' }}>
        新建/停用优惠码，保存后约 2 分钟生效。日期格式 YYYY-MM-DD（notAfter 当天失效）。
      </p>
      <CouponsManager coupons={couponsData as any[]} />
    </div>
  );
}
