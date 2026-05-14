import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardContent from './DashboardContent'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('tenant_users')
    .select('tenant_id, tenants(name)')
    .eq('auth_user_id', user.id)
    .single()

  const tenantId = membership?.tenant_id ?? ''
  const tenantName = (membership?.tenants as { name?: string } | null)?.name ?? 'Dashboard'

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{tenantName}</h1>
        <p className="text-white/60 text-sm mt-1">Usage overview</p>
      </div>

      <DashboardContent tenantId={tenantId} />
    </div>
  )
}
