'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardCharts, { type ChartPoint } from './DashboardCharts'

type Stats = { total: number; completedOnboarding: number; optedOut: number }

type Props = { tenantId: string }

function formatMonth(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export default function DashboardContent({ tenantId }: Props) {
  const [supabase] = useState(() => createClient())
  const [stats, setStats] = useState<Stats>({ total: 0, completedOnboarding: 0, optedOut: 0 })
  const [usersPerMonth, setUsersPerMonth] = useState<ChartPoint[]>([])
  const [messagesPerMonth, setMessagesPerMonth] = useState<ChartPoint[]>([])

  const fetchStats = useCallback(async () => {
    const { data: users } = await supabase
      .from('users')
      .select('onboarding_complete, opted_out')
      .eq('tenant_id', tenantId)
    setStats({
      total: users?.length ?? 0,
      completedOnboarding: users?.filter(u => u.onboarding_complete).length ?? 0,
      optedOut: users?.filter(u => u.opted_out).length ?? 0,
    })
  }, [supabase, tenantId])

  const fetchSnapshots = useCallback(async () => {
    const { data: snapshots } = await supabase
      .from('monthly_billing_snapshots')
      .select('billing_month, active_users, conversations')
      .eq('tenant_id', tenantId)
      .order('billing_month', { ascending: true })
    setUsersPerMonth((snapshots ?? []).map(s => ({
      month: formatMonth(s.billing_month),
      value: s.active_users,
    })))
    setMessagesPerMonth((snapshots ?? []).map(s => ({
      month: formatMonth(s.billing_month),
      value: s.conversations,
    })))
  }, [supabase, tenantId])

  useEffect(() => {
    fetchStats()
    fetchSnapshots()

    const usersChannel = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `tenant_id=eq.${tenantId}` }, fetchStats)
      .subscribe()

    const snapshotsChannel = supabase
      .channel('snapshots-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monthly_billing_snapshots', filter: `tenant_id=eq.${tenantId}` }, fetchSnapshots)
      .subscribe()

    return () => {
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(snapshotsChannel)
    }
  }, [fetchStats, fetchSnapshots, supabase, tenantId])

  return (
    <>
      <div className="mb-4">
        <div className="bg-white rounded-2xl border border-border/20 p-6">
          <div className="grid grid-cols-3 divide-x divide-border/20">
            <div className="pr-6">
              <p className="text-sm text-muted-foreground/60">Total homeowners</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.total.toLocaleString()}</p>
            </div>
            <div className="px-6">
              <p className="text-sm text-muted-foreground/60">Completed Onboarding</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.completedOnboarding.toLocaleString()}</p>
            </div>
            <div className="pl-6">
              <p className="text-sm text-muted-foreground/60">Opted out</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.optedOut.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <DashboardCharts usersPerMonth={usersPerMonth} messagesPerMonth={messagesPerMonth} />
    </>
  )
}
