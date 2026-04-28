import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

const mockRedirect = jest.fn()
const mockGetUser = jest.fn()
const mockSingle = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (path: string) => { mockRedirect(path); throw new Error(`NEXT_REDIRECT:${path}`) },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({ single: mockSingle }),
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
    mockSingle.mockResolvedValueOnce({
      data: {
        role: 'admin',
        tenants: { id: 'tenant-1', name: 'Armadillo Warranty', company_code: 'armadillo', support_email: null },
      },
    })

    render(await DashboardPage())

    expect(screen.getByText('Armadillo Warranty')).toBeInTheDocument()
    expect(screen.getByText(/admin@armadillo\.com/)).toBeInTheDocument()
    expect(screen.getByText(/admin/)).toBeInTheDocument()
  })

  it('falls back to "Dashboard" heading when tenant lookup returns null', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-1', email: 'admin@example.com' } },
    })
    mockSingle.mockResolvedValueOnce({ data: null })

    render(await DashboardPage())

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
