import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/auth'

const STATUS_TOOLTIPS: Record<string, string> = {
  opted_out: 'This homeowner has opted out of SMS messages. No further messages will be sent to them.',
  complete: 'Onboarding is complete. This homeowner has finished the setup process.',
  queued: 'This homeowner is queued for onboarding. Messages will begin sending soon.',
  failed: 'Onboarding failed. Review their profile to retry or investigate the issue.',
  pending: "Onboarding hasn't started yet. No messages have been sent to this homeowner.",
}

function StatusTooltipBadge({ label, colorClass, tooltip }: { label: string; colorClass: string; tooltip: string }) {
  return (
    <span className="relative inline-block group">
      <span className={`inline-block px-2 py-0.5 text-xs rounded-full cursor-default ${colorClass}`}>{label}</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 z-10 shadow-lg pointer-events-none">
        {tooltip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </span>
    </span>
  )
}

function statusBadge(u: { onboarding_complete: boolean; onboarding_status: string | null; opted_out: boolean }) {
  if (u.opted_out) return <StatusTooltipBadge label="Opted out" colorClass="bg-red-100 text-red-700" tooltip={STATUS_TOOLTIPS.opted_out} />
  if (u.onboarding_complete) return <StatusTooltipBadge label="Complete" colorClass="bg-green-100 text-green-700" tooltip={STATUS_TOOLTIPS.complete} />
  if (u.onboarding_status === 'queued') return <StatusTooltipBadge label="Queued" colorClass="bg-yellow-100 text-yellow-700" tooltip={STATUS_TOOLTIPS.queued} />
  if (u.onboarding_status === 'failed') return <StatusTooltipBadge label="Failed" colorClass="bg-red-100 text-red-700" tooltip={STATUS_TOOLTIPS.failed} />
  return <StatusTooltipBadge label="Pending" colorClass="bg-slate-100 text-slate-600" tooltip={STATUS_TOOLTIPS.pending} />
}

export default async function UsersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tenantId = await getTenantId(supabase, user.id)

  const { data: homeowners } = await supabase
    .from('users')
    .select('id, first_name, phone_number, city, state, onboarding_complete, onboarding_status, opted_out, created_at')
    .eq('tenant_id', tenantId ?? '')
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
