'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

export type ChartPoint = { month: string; value: number }

type Props = {
  usersPerMonth: ChartPoint[]
  messagesPerMonth: ChartPoint[]
}

export default function DashboardCharts({ usersPerMonth, messagesPerMonth }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-border/20 p-6">
        <p className="text-sm font-medium text-muted-foreground/80 mb-4">Homeowners over time</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={usersPerMonth} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(36,50,65,0.1)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(36,50,65,0.55)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'rgba(36,50,65,0.55)' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid rgba(36,50,65,0.15)', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#21B6A8"
              strokeWidth={2}
              dot={{ r: 3, fill: '#21B6A8' }}
              name="Active homeowners"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-border/20 p-6">
        <p className="text-sm font-medium text-muted-foreground/80 mb-4">Messages per month</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={messagesPerMonth} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(36,50,65,0.1)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(36,50,65,0.55)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'rgba(36,50,65,0.55)' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid rgba(36,50,65,0.15)', fontSize: 12 }}
            />
            <Bar dataKey="value" fill="#21B6A8" name="Messages" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
