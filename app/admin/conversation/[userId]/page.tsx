import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'

type ConvoMessage = {
  id: string
  role: string
  content: string
  created_at: string
  ai_quality_flag: boolean | null
  ai_quality_reason: string | null
  manually_reviewed: boolean | null
  manually_flagged: boolean | null
  manually_flagged_reason: string | null
}

async function getThreadData(userId: string) {
  const supabase = createServiceClient()

  // Paginate messages to avoid Supabase's 1,000-row default cap silently
  // truncating high-volume threads. The quality monitor uses the same pattern.
  const PAGE_SIZE = 1000
  const messages: ConvoMessage[] = []
  let from = 0

  for (;;) {
    const { data: page } = await supabase
      .from('conversations')
      .select('id, role, content, created_at, ai_quality_flag, ai_quality_reason, manually_reviewed, manually_flagged, manually_flagged_reason')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (!page || page.length === 0) break
    messages.push(...(page as ConvoMessage[]))
    if (page.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  const [{ data: user }, { data: homeDetails }] = await Promise.all([
    supabase.from('users').select('id, first_name, last_name, phone_number').eq('id', userId).single(),
    supabase.from('home_details').select('*').eq('user_id', userId).single(),
  ])

  return { user, messages, homeDetails }
}

export default async function ConversationThreadPage({ params }: { params: { userId: string } }) {
  const { user, messages, homeDetails } = await getThreadData(params.userId)

  if (!user) notFound()

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown'
  const flaggedMessages = messages.filter(m => m.ai_quality_flag)
  const mostRecent = messages[messages.length - 1]

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a href="/admin/conversations" style={{ color: '#64748b', fontSize: '13px' }}>← Back to Conversations</a>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>{displayName}</h1>
        <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '13px' }}>{user.phone_number}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

        {/* Chat thread */}
        <div>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {mostRecent && (
              <>
                <form action={`/api/admin/conversations/${params.userId}/review`} method="POST" style={{ display: 'inline' }}>
                  <button type="submit" className="btn btn-green">✓ Mark Reviewed</button>
                </form>
                <form action={`/api/admin/conversations/${params.userId}/flag`} method="POST" style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" name="reason" placeholder="Flag reason…" required style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', fontSize: '12px' }} />
                  <button type="submit" className="btn btn-red">⚑ Flag</button>
                </form>
                <form action={`/api/admin/conversations/${params.userId}/flag`} method="POST" style={{ display: 'inline' }}>
                  <input type="hidden" name="unflag" value="true" />
                  <button type="submit" className="btn btn-gray">✕ Unflag</button>
                </form>
              </>
            )}
          </div>

          {/* AI quality result */}
          {flaggedMessages.length > 0 && (
            <div style={{ background: '#7f1d1d', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px' }}>
              <div style={{ color: '#fca5a5', fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}>
                🚩 AI Quality Flag
              </div>
              {flaggedMessages.map(m => (
                <div key={m.id} style={{ color: '#fecaca', fontSize: '12px', marginBottom: '4px' }}>
                  {(m.ai_quality_reason ?? '').split('; ').map((issue: string, i: number) => (
                    <div key={i} style={{ marginBottom: '2px' }}>• {issue}</div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map(msg => {
              const isUser = msg.role === 'user'
              return (
                <div key={msg.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-start' : 'flex-end',
                }}>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '3px' }}>
                    {isUser ? '👤 Homeowner' : msg.role === 'staff' ? '👥 Staff' : '🤖 Assistant'} · {new Date(msg.created_at).toLocaleString()}
                  </div>
                  <div style={{
                    background: isUser ? '#1e293b' : msg.role === 'staff' ? '#164e63' : '#1e3a5f',
                    color: '#e2e8f0',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    maxWidth: '80%',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </div>
                </div>
              )
            })}
            {messages.length === 0 && (
              <p style={{ color: '#64748b' }}>No messages found.</p>
            )}
          </div>
        </div>

        {/* Sidebar: home details */}
        <div className="card" style={{ position: 'sticky', top: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px' }}>Home Details</h3>
          {homeDetails ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(homeDetails)
                .filter(([key]) => !['id', 'user_id', 'created_at', 'updated_at'].includes(key))
                .map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                    <span style={{ color: value !== null && value !== undefined ? '#e2e8f0' : '#374151', fontWeight: value !== null ? 500 : 400 }}>
                      {value !== null && value !== undefined ? String(value) : '—'}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '12px' }}>No home details recorded.</p>
          )}
        </div>
      </div>
    </div>
  )
}
