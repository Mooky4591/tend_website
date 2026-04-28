import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

const mockRedirect = jest.fn()
const mockGetUser = jest.fn()
const mockReturns = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (path: string) => { mockRedirect(path); throw new Error(`NEXT_REDIRECT:${path}`) },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => ({
              returns: mockReturns,
            }),
          }),
        }),
      }),
    }),
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('DashboardPage', () => {
  it('redirects to /login when no session exists', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('renders the tenant name and user email when authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-1', email: 'admin@armadillo.com' } },
    })
    mockReturns.mockResolvedValueOnce({
      data: [{
        role: 'admin',
        tenants: { id: 'tenant-1', name: 'Armadillo Warranty', company_code: 'armadillo', support_email: null },
      }],
    })

    render(await DashboardPage())

    expect(screen.getByText('Armadillo Warranty')).toBeInTheDocument()
    expect(screen.getByText(/admin@armadillo\.com/)).toBeInTheDocument()
    expect(screen.getByText(/admin/)).toBeInTheDocument()
  })

  it('falls back to "Dashboard" heading when user has no tenant memberships', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-1', email: 'admin@example.com' } },
    })
    mockReturns.mockResolvedValueOnce({ data: [] })

    render(await DashboardPage())

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('falls back to "Dashboard" heading when membership data is null', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-1', email: 'admin@example.com' } },
    })
    mockReturns.mockResolvedValueOnce({ data: null })

    render(await DashboardPage())

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('shows an error UI and does not crash when the tenant query fails', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-1', email: 'admin@example.com' } },
    })
    mockReturns.mockResolvedValueOnce({ data: null, error: { message: 'permission denied' } })

    render(await DashboardPage())

    expect(screen.getByText('Unable to load your account information.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'support@trytendr.org' })).toBeInTheDocument()
  })

  it('uses the first membership when the user belongs to multiple tenants', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-1', email: 'multi@example.com' } },
    })
    mockReturns.mockResolvedValueOnce({
      data: [
        {
          role: 'admin',
          tenants: { id: 'tenant-1', name: 'First Company', company_code: 'first', support_email: null },
        },
        {
          role: 'viewer',
          tenants: { id: 'tenant-2', name: 'Second Company', company_code: 'second', support_email: null },
        },
      ],
    })

    render(await DashboardPage())

    expect(screen.getByText('First Company')).toBeInTheDocument()
    expect(screen.queryByText('Second Company')).not.toBeInTheDocument()
  })
})
