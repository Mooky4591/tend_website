import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/auth'

function formatMonth(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })
}

export default async function BillingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tenantId = await getTenantId(supabase, user.id)

  const { data: snapshots } = await supabase
    .from('monthly_billing_snapshots')
    .select('billing_month, active_users, new_users, reminders_sent, conversations')
    .eq('tenant_id', tenantId ?? '')
    .order('billing_month', { ascending: false })

  const PRICE_PER_USER = 7

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground/60 text-sm mt-1">Monthly usage snapshots</p>
      </div>

      <div className="bg-white rounded-2xl border border-border/20 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20 bg-muted">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground/80">Month</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground/80">Active users</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground/80">New users</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground/80">Reminders sent</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground/80">Conversations</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground/80">Amount due</th>
            </tr>
          </thead>
          <tbody>
            {(snapshots ?? []).map(s => (
              <tr key={s.billing_month} className="border-b border-border/10">
                <td className="px-4 py-3 font-medium text-foreground">{formatMonth(s.billing_month)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{s.active_users.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{s.new_users.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{s.reminders_sent.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{s.conversations.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">${(s.active_users * PRICE_PER_USER).toLocaleString()}</td>
              </tr>
            ))}
            {(snapshots ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground/50 text-sm">No billing data yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-muted rounded-2xl border border-border/20 p-6">
        <p className="text-sm font-medium text-muted-foreground">Questions about your bill?</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Contact us at{' '}
          <a href="mailto:support@trytendr.org" className="text-foreground underline">
            support@trytendr.org
          </a>{' '}
          and we&apos;ll get back to you within one business day.
        </p>
      </div>
    </div>
  )
}
