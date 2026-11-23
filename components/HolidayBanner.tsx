import { readOrdersJson } from '@/lib/admin-gh';

export const revalidate = 30;

// 节假日横幅：由 /admin/settings 控制（存在订单仓库快速通道，1 分钟内全站生效）
export default async function HolidayBanner() {
  let settings: any = null;
  try {
    settings = (await readOrdersJson('site-settings.json'))?.data;
  } catch {
    return null;
  }
  const h = settings?.holidayMode;
  if (!h?.enabled || !h.title) return null;
  return (
    <div style={{ background: '#7c3aed', color: '#fff', textAlign: 'center', padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>
      <span style={{ marginRight: 8 }}>🎉</span>
      {h.title}
      {h.message ? <span style={{ opacity: 0.9, fontWeight: 400 }}> — {h.message}</span> : null}
    </div>
  );
}
