'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardCharts, { type ChartPoint } from './DashboardCharts'

type Stats = { total: number; completedOnboarding: number; optedOut: number }

type Props = { tenantId: string }

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function enumerateMonths(startKey: string, endKey: string): string[] {
  const [sy, sm] = startKey.split('-').map(Number)
  const [ey, em] = endKey.split('-').map(Number)
  const out: string[] = []
  let y = sy
  let m = sm
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return out
}

export default function DashboardContent({ tenantId }: Props) {
  const [supabase] = useState(() => createClient())
  const [stats, setStats] = useState<Stats>({ total: 0, completedOnboarding: 0, optedOut: 0 })
  const [usersPerMonth, setUsersPerMonth] = useState<ChartPoint[]>([])
  const [messagesPerMonth, setMessagesPerMonth] = useState<ChartPoint[]>([])

  const fetchUsers = useCallback(async () => {
    const { data: users, error } = await supabase
      .from('users')
      .select('created_at, onboarding_complete, opted_out')
      .eq('tenant_id', tenantId)
    if (error) { console.error('fetchUsers error:', error); return }

    const rows = users ?? []
    setStats({
      total: rows.length,
      completedOnboarding: rows.filter(u => u.onboarding_complete).length,
      optedOut: rows.filter(u => u.opted_out).length,
    })

    const dated = rows.filter(u => u.created_at)
    if (dated.length === 0) {
      setUsersPerMonth([])
      return
    }

    const sorted = [...dated].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    const firstKey = monthKey(new Date(sorted[0].created_at))
    const nowKey = monthKey(new Date())
    const months = enumerateMonths(firstKey, nowKey)

    let cumulative = 0
    let idx = 0
    const points: ChartPoint[] = months.map(key => {
      while (idx < sorted.length && monthKey(new Date(sorted[idx].created_at)) <= key) {
        cumulative++
        idx++
      }
      return { month: formatMonthLabel(key), value: cumulative }
    })
    setUsersPerMonth(points)
  }, [supabase, tenantId])

  const fetchMessages = useCallback(async () => {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('created_at')
      .eq('tenant_id', tenantId)
    if (error) { console.error('fetchMessages error:', error); return }

    const rows = (conversations ?? []).filter(r => r.created_at)
    if (rows.length === 0) {
      setMessagesPerMonth([])
      return
    }

    const counts = new Map<string, number>()
    for (const r of rows) {
      const key = monthKey(new Date(r.created_at))
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    const firstKey = [...counts.keys()].sort()[0]
    const nowKey = monthKey(new Date())
    const months = enumerateMonths(firstKey, nowKey)
    setMessagesPerMonth(months.map(key => ({
      month: formatMonthLabel(key),
      value: counts.get(key) ?? 0,
    })))
  }, [supabase, tenantId])

  useEffect(() => {
    fetchUsers()
    fetchMessages()

    const usersChannel = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `tenant_id=eq.${tenantId}` }, fetchUsers)
      .subscribe()

    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `tenant_id=eq.${tenantId}` }, fetchMessages)
      .subscribe()

    return () => {
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(conversationsChannel)
    }
  }, [fetchUsers, fetchMessages, supabase, tenantId])

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
