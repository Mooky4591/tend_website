import { createServiceClient } from '@/lib/supabase/service'

export default async function AlertsPage() {
  const supabase = createServiceClient()

  const { data: alerts } = await supabase
    .from('system_alerts')
    .select(`
      id,
      alert_type,
      description,
      created_at,
      user_id,
      users:user_id (first_name, last_name, phone_number)
    `)
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  const rows = alerts ?? []

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: '#f1f5f9' }}>
        System Alerts
        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>
          ({rows.length} unresolved)
        </span>
      </h1>

      {rows.length === 0 ? (
        <p style={{ color: '#64748b' }}>No unresolved alerts. ✓</p>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Alert Type</th>
                <th>User</th>
                <th>Description</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const user = row.users as { first_name?: string; last_name?: string; phone_number?: string } | null
                const userName = user
                  ? [user.first_name, user.last_name].filter(Boolean).join(' ') || '—'
                  : '—'
                return (
                  <tr key={row.id}>
                    <td>
                      <span className="badge badge-red">{row.alert_type}</span>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      <div style={{ fontWeight: 500 }}>{userName}</div>
                      {user?.phone_number && (
                        <div style={{ color: '#64748b', fontFamily: 'monospace' }}>{user.phone_number}</div>
                      )}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '12px', maxWidth: '300px' }}>
                      {row.description}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td>
                      <form action={`/api/admin/alerts/${row.id}/resolve`} method="POST">
                        <button type="submit" className="btn btn-green" style={{ fontSize: '11px' }}>
                          Resolve
                        </button>
                      </form>
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
