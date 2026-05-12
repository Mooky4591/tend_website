# AI Contract: app/dashboard/DashboardCharts.tsx

## Purpose
Client Component that renders two data visualizations on the dashboard overview: a line chart showing active homeowners per month and a bar chart showing messages per month. Receives pre-fetched, pre-formatted data as props from `DashboardPage`.

## Allowed Responsibilities
- Accept `usersPerMonth` and `messagesPerMonth` arrays of `{ month: string; value: number }` as props.
- Render a Recharts `LineChart` for homeowner growth over time.
- Render a Recharts `BarChart` for messages per month.
- Apply theme colors consistent with the app palette (teal `#21B6A8`, deep-slate axis labels).
- Export the `ChartPoint` type for use by `DashboardPage`.

## Not Allowed
- Do not fetch data from Supabase or any API — all data must come through props.
- Do not manage local state beyond what Recharts handles internally.
- Do not add mutation controls or navigation links.
- Do not add additional chart types without updating this contract.

## Public Interfaces
- `export type ChartPoint = { month: string; value: number }`
- `export default function DashboardCharts({ usersPerMonth, messagesPerMonth }: Props): JSX.Element`

## Required Patterns
- Must include `'use client'` directive (Recharts requires browser APIs).
- Both charts wrapped in `ResponsiveContainer` for responsive layout.
- Chart cards styled with `bg-white rounded-2xl border border-border/20 p-6` to match other dashboard cards.

## Tests Required
- Renders without crashing when passed empty arrays.
- Renders without crashing when passed populated data.
- Chart section labels ("Homeowners over time", "Messages per month") are present in the DOM.
