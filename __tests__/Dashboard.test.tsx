import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

const mockRedirect = jest.fn()
const mockGetUser = jest.fn()
const mockTenantSingle = jest.fn()
const mockUsersEq = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (path: string) => { mockRedirect(path); throw new Error(`NEXT_REDIRECT:${path}`) },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      switch (table) {
        case 'tenant_users':
          return { select: () => ({ eq: () => ({ single: mockTenantSingle }) }) }
        case 'users':
          return { select: () => ({ eq: mockUsersEq }) }
        default:
          throw new Error(`Unexpected table in mock: ${table}`)
      }
    },
  }),
}))

const AUTHED_USER = { id: 'user-1', email: 'admin@acme.com' }
const MEMBERSHIP = { tenant_id: 'tenant-1', tenants: { name: 'Acme Warranty' } }

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } })
  mockTenantSingle.mockResolvedValue({ data: MEMBERSHIP })
  mockUsersEq.mockResolvedValue({ data: [] })
})

describe('DashboardPage', () => {
  it('redirects to /login when no session exists', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('renders the tenant name when authenticated', async () => {
    render(await DashboardPage())
    expect(screen.getByText('Acme Warranty')).toBeInTheDocument()
  })

  it('falls back to "Dashboard" heading when tenant query returns null', async () => {
    mockTenantSingle.mockResolvedValueOnce({ data: null })
    render(await DashboardPage())
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('shows zero counts when there are no users', async () => {
    render(await DashboardPage())
    expect(screen.getAllByText('0')).toHaveLength(3)
  })

  it('counts fully provisioned as onboarding_complete', async () => {
    mockUsersEq.mockResolvedValueOnce({
      data: [
        { onboarding_complete: true, opted_out: false },
        { onboarding_complete: true, opted_out: false },
        { onboarding_complete: false, opted_out: false },
      ],
    })

    render(await DashboardPage())

    expect(screen.getByText('Total homeowners').closest('div')).toHaveTextContent('3')
    expect(screen.getByText('Fully provisioned').closest('div')).toHaveTextContent('2')
  })

  it('counts opted-out users correctly', async () => {
    mockUsersEq.mockResolvedValueOnce({
      data: [
        { onboarding_complete: false, opted_out: true },
        { onboarding_complete: false, opted_out: true },
        { onboarding_complete: false, opted_out: false },
      ],
    })

    render(await DashboardPage())

    expect(screen.getByText('Opted out').closest('div')).toHaveTextContent('2')
  })

  it('handles null users response without crashing', async () => {
    mockUsersEq.mockResolvedValueOnce({ data: null })
    render(await DashboardPage())
    expect(screen.getAllByText('0')).toHaveLength(3)
  })
})
