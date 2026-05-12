import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardCharts, { type ChartPoint } from './DashboardCharts'

function formatMonth(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('tenant_users')
    .select('tenant_id, tenants(name)')
    .eq('auth_user_id', user.id)
    .single()

  const tenantId = membership?.tenant_id ?? null
  const tenantName = (membership?.tenants as { name?: string } | null)?.name ?? 'Dashboard'

  const [{ data: users }, { data: snapshots }] = await Promise.all([
    supabase
      .from('users')
      .select('onboarding_complete, opted_out')
      .eq('tenant_id', tenantId ?? ''),
    supabase
      .from('monthly_billing_snapshots')
      .select('billing_month, active_users, conversations')
      .eq('tenant_id', tenantId ?? '')
      .order('billing_month', { ascending: true }),
  ])

  const total = users?.length ?? 0
  const completedOnboarding = users?.filter(u => u.onboarding_complete).length ?? 0
  const optedOut = users?.filter(u => u.opted_out).length ?? 0

  const usersPerMonth: ChartPoint[] = (snapshots ?? []).map(s => ({
    month: formatMonth(s.billing_month),
    value: s.active_users,
  }))

  const messagesPerMonth: ChartPoint[] = (snapshots ?? []).map(s => ({
    month: formatMonth(s.billing_month),
    value: s.conversations,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{tenantName}</h1>
        <p className="text-white/60 text-sm mt-1">Usage overview</p>
      </div>

      <div className="mb-4">
        <div className="bg-white rounded-2xl border border-border/20 p-6">
          <div className="grid grid-cols-3 divide-x divide-border/20">
            <div className="pr-6">
              <p className="text-sm text-muted-foreground/60">Total homeowners</p>
              <p className="text-3xl font-bold text-foreground mt-1">{total.toLocaleString()}</p>
            </div>
            <div className="px-6">
              <p className="text-sm text-muted-foreground/60">Completed Onboarding</p>
              <p className="text-3xl font-bold text-foreground mt-1">{completedOnboarding.toLocaleString()}</p>
            </div>
            <div className="pl-6">
              <p className="text-sm text-muted-foreground/60">Opted out</p>
              <p className="text-3xl font-bold text-foreground mt-1">{optedOut.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <DashboardCharts usersPerMonth={usersPerMonth} messagesPerMonth={messagesPerMonth} />
    </div>
  )
}
