import { render, screen } from '@testing-library/react'
import DashboardCharts from '@/app/dashboard/DashboardCharts'

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}))

const SAMPLE_USERS = [
  { month: 'Nov 25', value: 6 },
  { month: 'Dec 25', value: 10 },
  { month: 'Jan 26', value: 14 },
]

const SAMPLE_MESSAGES = [
  { month: 'Nov 25', value: 24 },
  { month: 'Dec 25', value: 40 },
  { month: 'Jan 26', value: 56 },
]

describe('DashboardCharts', () => {
  it('renders without crashing with empty arrays', () => {
    render(<DashboardCharts usersPerMonth={[]} messagesPerMonth={[]} />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders without crashing with populated data', () => {
    render(<DashboardCharts usersPerMonth={SAMPLE_USERS} messagesPerMonth={SAMPLE_MESSAGES} />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('displays the homeowners chart section label', () => {
    render(<DashboardCharts usersPerMonth={SAMPLE_USERS} messagesPerMonth={SAMPLE_MESSAGES} />)
    expect(screen.getByText('Homeowners over time')).toBeInTheDocument()
  })

  it('displays the messages chart section label', () => {
    render(<DashboardCharts usersPerMonth={SAMPLE_USERS} messagesPerMonth={SAMPLE_MESSAGES} />)
    expect(screen.getByText('Messages per month')).toBeInTheDocument()
  })
})
