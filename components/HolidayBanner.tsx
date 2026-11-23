const OWNER = 'jasonyuan886';

// 节假日横幅：由 /admin/settings 控制（存在订单仓库快速通道，1 分钟内全站生效）
export default async function HolidayBanner() {
  let settings: any = null;
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/freshlock-orders/contents/site-settings.json`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'freshlock-web',
      },
    });
    if (res.ok) {
      const file = await res.json();
      settings = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
    }
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
