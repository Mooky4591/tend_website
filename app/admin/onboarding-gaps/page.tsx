import { createServiceClient } from '@/lib/supabase/service'

export default async function OnboardingGapsPage() {
  const supabase = createServiceClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, first_name, last_name, phone_number, onboarding_gaps, onboarding_complete')
    .eq('onboarding_gap_flagged', true)
    .order('created_at', { ascending: false })

  const rows = users ?? []

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: '#f1f5f9' }}>
        Onboarding Gap Review
        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>
          ({rows.length} user{rows.length !== 1 ? 's' : ''})
        </span>
      </h1>

      {rows.length === 0 ? (
        <p style={{ color: '#64748b' }}>No onboarding gaps flagged. ✓</p>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Onboarding</th>
                <th>Missing Fields</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 500 }}>
                    {[row.first_name, row.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '12px' }}>
                    {row.phone_number ?? '—'}
                  </td>
                  <td>
                    <span className={`badge ${row.onboarding_complete ? 'badge-green' : 'badge-gray'}`}>
                      {row.onboarding_complete ? 'Complete' : 'Incomplete'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(row.onboarding_gaps ?? []).map((field: string) => (
                        <span key={field} className="badge badge-red" style={{ fontSize: '10px' }}>
                          {field.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <form action={`/api/admin/onboarding-gaps/${row.id}/resolve`} method="POST">
                      <button type="submit" className="btn btn-green" style={{ fontSize: '11px' }}>
                        Mark Resolved
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
