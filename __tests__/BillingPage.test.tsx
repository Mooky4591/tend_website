import { render, screen } from '@testing-library/react'
import BillingPage from '@/app/dashboard/billing/page'

const mockRedirect = jest.fn()
const mockGetUser = jest.fn()
const mockSnapshotsOrder = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (path: string) => { mockRedirect(path); throw new Error(`NEXT_REDIRECT:${path}`) },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({ order: mockSnapshotsOrder }),
    }),
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'staff-1' } } })
  mockSnapshotsOrder.mockResolvedValue({ data: [] })
})

describe('BillingPage', () => {
  it('redirects to /login when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(BillingPage()).rejects.toThrow('NEXT_REDIRECT:/login')
  })

  it('shows empty state when there are no snapshots', async () => {
    render(await BillingPage())
    expect(screen.getByText('No billing data yet')).toBeInTheDocument()
  })

  it('renders a row for each billing snapshot', async () => {
    mockSnapshotsOrder.mockResolvedValueOnce({
      data: [
        { billing_month: '2026-04-01', active_users: 42, new_users: 5, reminders_sent: 18, conversations: 130 },
        { billing_month: '2026-03-01', active_users: 38, new_users: 3, reminders_sent: 12, conversations: 95 },
      ],
    })

    render(await BillingPage())

    expect(screen.getByText('April 2026')).toBeInTheDocument()
    expect(screen.getByText('March 2026')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('130')).toBeInTheDocument()
  })

  it('renders all five columns (month, active, new, reminders, conversations)', async () => {
    mockSnapshotsOrder.mockResolvedValueOnce({
      data: [{ billing_month: '2026-04-01', active_users: 10, new_users: 2, reminders_sent: 5, conversations: 20 }],
    })

    render(await BillingPage())

    expect(screen.getByText('Active users')).toBeInTheDocument()
    expect(screen.getByText('New users')).toBeInTheDocument()
    expect(screen.getByText('Reminders sent')).toBeInTheDocument()
    expect(screen.getByText('Conversations')).toBeInTheDocument()
  })

  it('shows the support contact CTA', async () => {
    render(await BillingPage())
    expect(screen.getByRole('link', { name: 'support@trytendr.org' })).toBeInTheDocument()
  })
})
