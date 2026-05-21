import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export const metadata: Metadata = {
  title: 'Admin Login — Tendr',
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  // Already authenticated → go to admin home
  if (isAdminAuthenticated()) redirect('/admin')

  const error = searchParams.error

  return (
    <div style={{ maxWidth: '380px', margin: '60px auto' }}>
      <div style={{ background: '#1e293b', borderRadius: '12px', padding: '40px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '22px', margin: '0 0 8px', fontWeight: 700 }}>Tendr Admin</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 28px' }}>Enter your admin password to continue.</p>

        {error && (
          <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form action="/api/admin/auth" method="POST">
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            autoFocus
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
          />
          <button
            type="submit"
            style={{ marginTop: '16px', width: '100%', padding: '11px', borderRadius: '8px', background: '#3b82f6', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
