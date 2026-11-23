import { cookies } from 'next/headers';
import { isValidSession, ADMIN_COOKIE } from '@/lib/admin-auth';
import LogoutButton from './LogoutButton';
import AdminGate from './AdminGate';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/admin', icon: '📋', label: '订单' },
  { href: '/admin/products', icon: '📦', label: '商品' },
  { href: '/admin/coupons', icon: '🏷️', label: '折扣' },
  { href: '/admin/settings', icon: '🎉', label: '节假日' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = cookies().get(ADMIN_COOKIE)?.value;
  if (!isValidSession(session)) {
    // 未登录：整站渲染登录门（任何 /admin 路径都安全落在这，无重定向循环）
    return <AdminGate />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6f4ee', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', color: '#0b100e' }}>
      <header style={{ background: '#0b100e', color: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, height: 52, position: 'sticky', top: 0, zIndex: 40 }}>
        <span style={{ fontWeight: 800, fontSize: 16, marginRight: 6 }}>🛠️ FreshLock Admin</span>
        <nav style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto' }}>
          {NAV.map(n => (
            <a key={n.href} href={n.href} style={{ color: '#cfd6d2', textDecoration: 'none', fontSize: 13.5, padding: '6px 11px', borderRadius: 8, whiteSpace: 'nowrap' }}>
              {n.icon} {n.label}
            </a>
          ))}
        </nav>
        <LogoutButton />
      </header>
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '22px 16px 60px' }}>{children}</main>
    </div>
  );
}
