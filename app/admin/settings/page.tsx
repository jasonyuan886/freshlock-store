'use client';

import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({ enabled: false, title: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.holidayMode) setForm(d.holidayMode);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function save() {
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holidayMode: form }),
      });
      setMsg(res.ok ? '✅ 已保存，1 分钟内全站生效' : '❌ 保存失败');
    } catch { setMsg('❌ 网络错误'); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 6px' }}>🎉 节假日模式</h1>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 16px' }}>
        开启后全站顶部显示紫色横幅（1 分钟内生效，无需重新部署）。适合：黑五/圣诞/新年/店休通知。
      </p>
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', padding: 20, display: 'grid', gap: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} style={{ width: 18, height: 18 }} />
          开启节假日横幅
        </label>
        <div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 5 }}>标题（必填，≤80 字）</div>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="如：Merry Christmas — 圣诞季全场特惠进行中"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 5 }}>副文案（可空，≤200 字）</div>
          <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="如：12月24-26日订单将于27日发出，感谢理解 🎄"
            rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div style={{ background: form.enabled ? '#7c3aed' : '#eee', color: form.enabled ? '#fff' : '#999', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>
          🎉 {form.title || '（横幅预览）'}{form.message ? ` — ${form.message}` : ''}
        </div>
        <button disabled={busy || loading} onClick={save}
          style={{ padding: '11px', borderRadius: 9, border: 'none', background: '#2fb86b', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          {busy ? '保存中…' : '💾 保存设置'}
        </button>
        {msg && <p style={{ fontSize: 13, margin: 0 }}>{msg}</p>}
      </div>
    </div>
  );
}
