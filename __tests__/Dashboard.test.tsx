import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

const mockRedirect = jest.fn()
const mockGetUser = jest.fn()
const mockTenantSingle = jest.fn()

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
        default:
          throw new Error(`Unexpected table in mock: ${table}`)
      }
    },
  }),
}))

jest.mock('@/app/dashboard/DashboardContent', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-content" />,
}))

const AUTHED_USER = { id: 'user-1', email: 'admin@acme.com' }
const MEMBERSHIP = { tenant_id: 'tenant-1', tenants: { name: 'Acme Warranty' } }

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } })
  mockTenantSingle.mockResolvedValue({ data: MEMBERSHIP })
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

  it('renders the DashboardContent component', async () => {
    render(await DashboardPage())
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
  })
})
