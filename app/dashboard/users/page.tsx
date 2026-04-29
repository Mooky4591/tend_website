import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

function statusBadge(u: { onboarding_complete: boolean; onboarding_status: string | null; opted_out: boolean }) {
  if (u.opted_out) return <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Opted out</span>
  if (u.onboarding_complete) return <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Complete</span>
  if (u.onboarding_status === 'queued') return <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">Queued</span>
  if (u.onboarding_status === 'failed') return <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Failed</span>
  return <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">Pending</span>
}

export default async function UsersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('auth_user_id', user.id)
    .single()

  const { data: homeowners } = await supabase
    .from('users')
    .select('id, first_name, phone_number, city, state, onboarding_complete, onboarding_status, opted_out, created_at')
    .eq('tenant_id', membership?.tenant_id ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Homeowners</h1>
        <p className="text-slate-500 text-sm mt-1">{homeowners?.length ?? 0} total</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Location</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {(homeowners ?? []).map(h => (
              <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/users/${h.id}`} className="font-medium text-slate-900 hover:underline">
                    {h.first_name ?? '—'}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{h.phone_number}</td>
                <td className="px-4 py-3 text-slate-500">
                  {[h.city, h.state].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-4 py-3">{statusBadge(h)}</td>
              </tr>
            ))}
            {(homeowners ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-sm">No homeowners yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
