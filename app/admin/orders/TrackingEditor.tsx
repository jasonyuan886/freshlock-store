'use client';

import { useState } from 'react';

export default function TrackingEditor({ id, initial, customerEmail }: { id: string; initial: string; customerEmail: string }) {
  const [val, setVal] = useState(initial || '');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy) return;
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/orders/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tracking: val.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg(d.skipped ? 'ℹ️ 单号未变化' : `✅ 已保存，追踪信已发至客户邮箱${customerEmail ? ' (' + customerEmail + ')' : ''}`);
      } else {
        setMsg('❌ ' + (d.error || '保存失败'));
      }
    } catch {
      setMsg('❌ 网络错误');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eceae2', padding: '14px 16px', marginBottom: 16 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>🚚 发货 · 快递单号</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="输入快递单号（云途/17TRACK 通用）"
          style={{ flex: 1, minWidth: 200, padding: '9px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 14 }}
        />
        <button onClick={save} disabled={busy || !val.trim()}
          style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#2fb86b', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {busy ? '保存中…' : '保存并发信'}
        </button>
      </div>
      <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
        保存后系统自动给客户发"已发货+追踪链接"邮件；改单号会重发一封。{initial ? `当前单号: ${initial}` : '尚未填写'}
      </div>
      {msg && <div style={{ fontSize: 13, marginTop: 6 }}>{msg}</div>}
    </div>
  );
}
