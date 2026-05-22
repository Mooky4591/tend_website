import { createServiceClient } from '@/lib/supabase/service'

async function getStats() {
  const supabase = createServiceClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: onboardingComplete },
    { count: gapFlagged },
    { count: conversationsToday },
    { count: remindersSentWeek },
    { count: unresolvedAlerts },
    { count: aiQualityFlagged },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('onboarding_complete', true),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('onboarding_gap_flagged', true),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('sent', true).gte('created_at', weekAgo),
    supabase.from('system_alerts').select('*', { count: 'exact', head: true }).eq('resolved', false),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('ai_quality_flag', true).gte('created_at', weekAgo),
  ])

  return {
    totalUsers: totalUsers ?? 0,
    onboardingComplete: onboardingComplete ?? 0,
    gapFlagged: gapFlagged ?? 0,
    conversationsToday: conversationsToday ?? 0,
    remindersSentWeek: remindersSentWeek ?? 0,
    unresolvedAlerts: unresolvedAlerts ?? 0,
    aiQualityFlagged: aiQualityFlagged ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const statItems = [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Onboarding Complete', value: stats.onboardingComplete },
    { label: 'Onboarding Gaps Flagged', value: stats.gapFlagged },
    { label: 'Conversations Today', value: stats.conversationsToday },
    { label: 'Reminders Sent (7d)', value: stats.remindersSentWeek },
    { label: 'Unresolved Alerts', value: stats.unresolvedAlerts },
    { label: 'AI Quality Flagged (7d)', value: stats.aiQualityFlagged },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: '#f1f5f9' }}>
        Dashboard
      </h1>

      <div className="stat-grid">
        {statItems.map(item => (
          <div key={item.label} className="stat-card">
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px' }}>
          Quick Links
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="/admin/conversations" className="btn btn-blue">Review Conversations</a>
          <a href="/admin/onboarding-gaps" className="btn btn-gray">Onboarding Gaps</a>
          <a href="/admin/alerts" className="btn btn-red">System Alerts</a>
          <a href="/admin/users" className="btn btn-gray">All Users</a>
        </div>
      </div>
    </div>
  )
}
