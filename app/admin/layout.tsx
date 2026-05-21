import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import './admin.css'

export const metadata: Metadata = {
  title: 'Admin — Tendr',
}

const NAV_LINKS = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/admin/conversations', label: '💬 Conversations' },
  { href: '/admin/onboarding-gaps', label: '🔍 Onboarding Gaps' },
  { href: '/admin/alerts', label: '🚨 Alerts' },
  { href: '/admin/users', label: '👤 Users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Skip auth guard for the login page itself so the middleware x-pathname header
  // prevents the redirect-to-login-from-login loop.
  const pathname = headers().get('x-pathname') ?? ''
  if (!pathname.startsWith('/admin/login') && !isAdminAuthenticated()) {
    redirect('/admin/login')
  }

  return (
    <>
      <nav style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '4px', height: '52px' }}>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '15px', marginRight: '16px' }}>Tendr Admin</span>
        {NAV_LINKS.map(link => (
          <a
            key={link.href}
            href={link.href}
            style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', color: '#cbd5e1', textDecoration: 'none' }}
          >
            {link.label}
          </a>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <form action="/api/admin/auth" method="POST" style={{ display: 'inline' }}>
            <input type="hidden" name="action" value="logout" />
            <button type="submit" style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <main style={{ padding: '28px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </>
  )
}
