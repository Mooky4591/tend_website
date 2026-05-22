import { createServiceClient } from '@/lib/supabase/service'

export default async function AdminUsersPage() {
  const supabase = createServiceClient()

  // Paginate both queries to avoid Supabase's 1,000-row default cap.
  const PAGE_SIZE = 1000

  // Fetch all users — paginate so tenants with > 1,000 homeowners are not silently truncated.
  type UserRow = {
    id: string
    first_name: string | null
    last_name: string | null
    phone_number: string | null
    onboarding_complete: boolean | null
    onboarding_gap_flagged: boolean | null
    created_at: string
    tenants: { name?: string } | null
  }
  const allUsers: UserRow[] = []
  let usersFrom = 0

  for (;;) {
    const { data: page } = await supabase
      .from('users')
      .select('id, first_name, last_name, phone_number, onboarding_complete, onboarding_gap_flagged, created_at, tenants:tenant_id (name)')
      .order('created_at', { ascending: false })
      .range(usersFrom, usersFrom + PAGE_SIZE - 1)

    if (!page || page.length === 0) break
    allUsers.push(...(page as UserRow[]))
    if (page.length < PAGE_SIZE) break
    usersFrom += PAGE_SIZE
  }

  // Fetch conversation counts per user — paginate to avoid Supabase's 1,000-row cap.
  const allConvos: Array<{ user_id: string; created_at: string }> = []
  let convosFrom = 0

  for (;;) {
    const { data: page } = await supabase
      .from('conversations')
      .select('user_id, created_at')
      .range(convosFrom, convosFrom + PAGE_SIZE - 1)

    if (!page || page.length === 0) break
    allConvos.push(...page)
    if (page.length < PAGE_SIZE) break
    convosFrom += PAGE_SIZE
  }

  const countMap = new Map<string, { count: number; lastAt: string }>()
  for (const c of allConvos) {
    const entry = countMap.get(c.user_id)
    if (!entry) {
      countMap.set(c.user_id, { count: 1, lastAt: c.created_at })
    } else {
      entry.count++
      if (c.created_at > entry.lastAt) entry.lastAt = c.created_at
    }
  }

  const rows = allUsers

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: '#f1f5f9' }}>
        All Users
        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>
          ({rows.length} total)
        </span>
      </h1>

      {rows.length === 0 ? (
        <p style={{ color: '#64748b' }}>No users yet.</p>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Tenant</th>
                <th>Onboarding</th>
                <th>Gap Flagged</th>
                <th>Conversations</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const stats = countMap.get(row.id)
                const tenant = row.tenants as { name?: string } | null
                return (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 500 }}>
                      {[row.first_name, row.last_name].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '12px' }}>
                      {row.phone_number ?? '—'}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>
                      {tenant?.name ?? '—'}
                    </td>
                    <td>
                      <span className={`badge ${row.onboarding_complete ? 'badge-green' : 'badge-gray'}`}>
                        {row.onboarding_complete ? 'Complete' : 'Incomplete'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${row.onboarding_gap_flagged ? 'badge-red' : 'badge-gray'}`}>
                        {row.onboarding_gap_flagged ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8', textAlign: 'center' }}>
                      {stats?.count ?? 0}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {stats?.lastAt ? new Date(stats.lastAt).toLocaleString() : '—'}
                    </td>
                    <td>
                      <a href={`/admin/conversation/${row.id}`} className="btn btn-blue" style={{ fontSize: '11px' }}>
                        Thread
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
