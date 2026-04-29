import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type StatCardProps = { label: string; value: number; sub?: string }

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
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

  const { data: users } = await supabase
    .from('users')
    .select('onboarding_complete, opted_out')
    .eq('tenant_id', tenantId ?? '')

  const total = users?.length ?? 0
  const fullyProvisioned = users?.filter(u => u.onboarding_complete).length ?? 0
  const optedOut = users?.filter(u => u.opted_out).length ?? 0

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{tenantName}</h1>
        <p className="text-slate-500 text-sm mt-1">Usage overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total homeowners" value={total} />
        <StatCard
          label="Fully provisioned"
          value={fullyProvisioned}
          sub="Onboarding complete"
        />
        <StatCard label="Opted out" value={optedOut} />
      </div>
    </div>
  )
}
