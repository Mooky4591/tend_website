import { createServiceClient } from '@/lib/supabase/service'

async function getConversationReview() {
  const supabase = createServiceClient()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Get users with conversations in the last 7 days — paginate to avoid Supabase's 1,000-row cap.
  const PAGE_SIZE = 1000
  type RecentConvo = { user_id: string; created_at: string; ai_quality_flag: boolean | null; ai_quality_reason: string | null; manually_flagged: boolean | null }
  const recentConvos: RecentConvo[] = []
  let from = 0

  for (;;) {
    const { data: page } = await supabase
      .from('conversations')
      .select('user_id, created_at, ai_quality_flag, ai_quality_reason, manually_flagged')
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (!page || page.length === 0) break
    recentConvos.push(...(page as RecentConvo[]))
    if (page.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  // Get unique user IDs
  const userIds = Array.from(new Set(recentConvos.map(c => c.user_id)))

  // Fetch user data
  const { data: users } = await supabase
    .from('users')
    .select('id, first_name, last_name, phone_number')
    .in('id', userIds)

  const userMap = new Map((users ?? []).map(u => [u.id, u]))

  // Get latest conversation per user
  const latestByUser = new Map<string, typeof recentConvos[0]>()
  for (const c of recentConvos) {
    if (!latestByUser.has(c.user_id)) {
      latestByUser.set(c.user_id, c)
    }
  }

  return userIds.map(userId => {
    const user = userMap.get(userId)
    const latest = latestByUser.get(userId)!
    return {
      userId,
      name: [user?.first_name, user?.last_name].filter(Boolean).join(' ') || '—',
      phone: user?.phone_number ?? '—',
      lastMessageAt: latest.created_at,
      aiQualityFlag: latest.ai_quality_flag,
      aiQualityReason: latest.ai_quality_reason ?? '',
      manuallyFlagged: latest.manually_flagged,
    }
  })
}

function truncate(text: string, len = 100): string {
  return text.length > len ? text.slice(0, len) + '…' : text
}

export default async function ConversationsPage() {
  const rows = await getConversationReview()

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: '#f1f5f9' }}>
        Conversation Review <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400 }}>(last 7 days)</span>
      </h1>

      {rows.length === 0 ? (
        <p style={{ color: '#64748b' }}>No conversations in the last 7 days.</p>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Last Message</th>
                <th>AI Flagged</th>
                <th>AI Reason</th>
                <th>Manually Flagged</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.userId}>
                  <td style={{ fontWeight: 500 }}>{row.name}</td>
                  <td style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '12px' }}>{row.phone}</td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}>{new Date(row.lastMessageAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${row.aiQualityFlag ? 'badge-red' : 'badge-green'}`}>
                      {row.aiQualityFlag ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px', color: '#94a3b8', fontSize: '12px' }}>
                    {truncate(row.aiQualityReason)}
                  </td>
                  <td>
                    <span className={`badge ${row.manuallyFlagged ? 'badge-red' : 'badge-gray'}`}>
                      {row.manuallyFlagged ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <a href={`/admin/conversation/${row.userId}`} className="btn btn-blue" style={{ marginRight: '6px' }}>
                      View Thread
                    </a>
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
