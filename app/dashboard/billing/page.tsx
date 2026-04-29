import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function formatMonth(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })
}

export default async function BillingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('auth_user_id', user.id)
    .single()

  const { data: snapshots } = await supabase
    .from('monthly_billing_snapshots')
    .select('billing_month, active_users, new_users, reminders_sent, conversations')
    .eq('tenant_id', membership?.tenant_id ?? '')
    .order('billing_month', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-500 text-sm mt-1">Monthly usage snapshots</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Month</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Active users</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">New users</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Reminders sent</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Conversations</th>
            </tr>
          </thead>
          <tbody>
            {(snapshots ?? []).map(s => (
              <tr key={s.billing_month} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{formatMonth(s.billing_month)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{s.active_users.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-700">{s.new_users.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-700">{s.reminders_sent.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-700">{s.conversations.toLocaleString()}</td>
              </tr>
            ))}
            {(snapshots ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">No billing data yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
        <p className="text-sm font-medium text-slate-700">Questions about your bill?</p>
        <p className="text-sm text-slate-500 mt-1">
          Contact us at{' '}
          <a href="mailto:support@trytendr.org" className="text-slate-900 underline">
            support@trytendr.org
          </a>{' '}
          and we'll get back to you within one business day.
        </p>
      </div>
    </div>
  )
}
