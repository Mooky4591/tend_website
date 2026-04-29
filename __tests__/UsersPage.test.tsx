import { render, screen } from '@testing-library/react'
import UsersPage from '@/app/dashboard/users/page'

const mockRedirect = jest.fn()
const mockGetUser = jest.fn()
const mockTenantSingle = jest.fn()
const mockUsersOrder = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (path: string) => { mockRedirect(path); throw new Error(`NEXT_REDIRECT:${path}`) },
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'tenant_users') {
        return { select: () => ({ eq: () => ({ single: mockTenantSingle }) }) }
      }
      if (table === 'users') {
        return { select: () => ({ eq: () => ({ order: mockUsersOrder }) }) }
      }
    },
  }),
}))

const AUTHED_USER = { id: 'staff-1', email: 'admin@acme.com' }
const MEMBERSHIP = { tenant_id: 'tenant-1' }

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } })
  mockTenantSingle.mockResolvedValue({ data: MEMBERSHIP })
  mockUsersOrder.mockResolvedValue({ data: [] })
})

describe('UsersPage', () => {
  it('redirects to /login when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(UsersPage()).rejects.toThrow('NEXT_REDIRECT:/login')
  })

  it('shows empty state when there are no homeowners', async () => {
    render(await UsersPage())
    expect(screen.getByText('No homeowners yet')).toBeInTheDocument()
    expect(screen.getByText('0 total')).toBeInTheDocument()
  })

  it('renders a row for each homeowner with name and phone', async () => {
    mockUsersOrder.mockResolvedValueOnce({
      data: [
        { id: 'u1', first_name: 'Alice', phone_number: '+15551111111', city: 'Austin', state: 'TX', onboarding_complete: true, onboarding_status: 'complete', opted_out: false, created_at: '2026-01-01' },
        { id: 'u2', first_name: 'Bob', phone_number: '+15552222222', city: null, state: null, onboarding_complete: false, onboarding_status: 'pending', opted_out: false, created_at: '2026-01-02' },
      ],
    })

    render(await UsersPage())

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('+15551111111')).toBeInTheDocument()
    expect(screen.getByText('2 total')).toBeInTheDocument()
  })

  it('links each homeowner name to their detail page', async () => {
    mockUsersOrder.mockResolvedValueOnce({
      data: [
        { id: 'user-abc', first_name: 'Alice', phone_number: '+15551111111', city: null, state: null, onboarding_complete: false, onboarding_status: 'pending', opted_out: false, created_at: '2026-01-01' },
      ],
    })

    render(await UsersPage())

    const link = screen.getByRole('link', { name: 'Alice' })
    expect(link).toHaveAttribute('href', '/dashboard/users/user-abc')
  })

  it('shows correct status badge for each onboarding status', async () => {
    mockUsersOrder.mockResolvedValueOnce({
      data: [
        { id: 'u1', first_name: 'Dana', phone_number: '+1', city: null, state: null, onboarding_complete: false, onboarding_status: 'pending', opted_out: true, created_at: '2026-01-01' },
        { id: 'u2', first_name: 'Eva', phone_number: '+2', city: null, state: null, onboarding_complete: true, onboarding_status: 'complete', opted_out: false, created_at: '2026-01-02' },
        { id: 'u3', first_name: 'Frank', phone_number: '+3', city: null, state: null, onboarding_complete: false, onboarding_status: 'queued', opted_out: false, created_at: '2026-01-03' },
      ],
    })

    render(await UsersPage())

    expect(screen.getByText('Opted out')).toBeInTheDocument()
    expect(screen.getAllByText('Complete')).toHaveLength(1)
    expect(screen.getByText('Queued')).toBeInTheDocument()
  })
})
