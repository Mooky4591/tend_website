import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type TenantRow = {
  id: string
  name: string
  company_code: string
  support_email: string | null
}

type TenantUserRow = {
  role: string
  tenants: TenantRow
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: memberships, error: queryError } = await supabase
    .from('tenant_users')
    .select('role, tenants(id, name, company_code, support_email)')
    .eq('auth_user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .returns<TenantUserRow[]>()

  if (queryError) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-700 font-medium text-sm">Unable to load your account information.</p>
          <p className="text-red-500 text-sm mt-1">
            Please try signing out and back in, or contact{' '}
            <a href="mailto:support@trytendr.org" className="underline">support@trytendr.org</a>.
          </p>
        </div>
      </div>
    )
  }

  const tenantUser = memberships?.[0] ?? null
  const tenant = tenantUser?.tenants ?? null

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {tenant?.name ?? 'Dashboard'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {user.email} · {tenantUser?.role ?? 'member'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <p className="text-slate-400 text-sm">Dashboard coming soon</p>
      </div>
    </div>
  )
}
