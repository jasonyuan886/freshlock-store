'use client';

export default function LogoutButton() {
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }
  return (
    <button onClick={logout} title="退出登录" style={{ background: 'transparent', border: '1px solid #3a4441', color: '#cfd6d2', borderRadius: 8, padding: '5px 10px', fontSize: 12.5, cursor: 'pointer' }}>
      🚪 退出
    </button>
  );
}
