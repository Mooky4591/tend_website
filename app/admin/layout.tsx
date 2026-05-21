import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'

const NAV_LINKS = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/admin/conversations', label: '💬 Conversations' },
  { href: '/admin/onboarding-gaps', label: '🔍 Onboarding Gaps' },
  { href: '/admin/alerts', label: '🚨 Alerts' },
  { href: '/admin/users', label: '👤 Users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminAuthenticated()) {
    redirect('/admin/login')
  }

  return (
    <html lang="en">
      <head>
        <title>Admin — Tendr</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
          a { color: #60a5fa; text-decoration: none; }
          a:hover { text-decoration: underline; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; padding: 10px 12px; background: #1e293b; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #334155; }
          td { padding: 10px 12px; border-bottom: 1px solid #1e293b; vertical-align: top; }
          tr:hover td { background: #1e293b; }
          .btn { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; }
          .btn-blue { background: #3b82f6; color: #fff; }
          .btn-red { background: #ef4444; color: #fff; }
          .btn-green { background: #22c55e; color: #fff; }
          .btn-gray { background: #374151; color: #d1d5db; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 500; }
          .badge-red { background: #7f1d1d; color: #fca5a5; }
          .badge-green { background: #14532d; color: #86efac; }
          .badge-gray { background: #1e293b; color: #94a3b8; }
          .card { background: #1e293b; border-radius: 10px; padding: 20px; }
          .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
          .stat-card { background: #1e293b; border-radius: 10px; padding: 18px; }
          .stat-value { font-size: 28px; font-weight: 700; color: #f1f5f9; }
          .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
        `}</style>
      </head>
      <body>
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
      </body>
    </html>
  )
}
