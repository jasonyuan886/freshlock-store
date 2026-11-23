'use client';

import { useState } from 'react';

export default function AdminGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { window.location.reload(); return; }
      setError(res.status === 429 ? '尝试太频繁，15 分钟后再试' : '密码不对，请重试');
    } catch { setError('网络错误，请重试'); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f4ee' }}>
      <form onSubmit={submit} style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', width: 340, boxShadow: '0 8px 30px rgba(11,16,14,.08)', border: '1px solid #eee' }}>
        <div style={{ fontSize: 40, textAlign: 'center' }}>🔐</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', margin: '10px 0 4px' }}>FreshLock 管理后台</h1>
        <p style={{ fontSize: 13, color: '#888', textAlign: 'center', margin: '0 0 22px' }}>请输入管理员密码</p>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoFocus
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
        {error && <p style={{ color: '#c0392b', fontSize: 13, margin: '10px 0 0' }}>{error}</p>}
        <button type="submit" disabled={busy} style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 10, border: 'none', background: '#2fb86b', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          {busy ? '验证中…' : '进入后台 →'}
        </button>
      </form>
    </div>
  );
}
