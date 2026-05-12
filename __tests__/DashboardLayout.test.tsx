import { render, screen } from '@testing-library/react'
import DashboardLayout from '@/app/dashboard/layout'

const mockRedirect = jest.fn()
const mockGetUser = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (path: string) => { mockRedirect(path); throw new Error(`NEXT_REDIRECT:${path}`) },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}))

jest.mock('@/app/dashboard/SignOutButton', () => ({
  __esModule: true,
  default: () => <button>Sign out</button>,
}))

jest.mock('@/app/dashboard/SettingsMenu', () => ({
  __esModule: true,
  default: () => <button>Settings</button>,
}))

jest.mock('@/app/dashboard/DashboardNav', () => ({
  __esModule: true,
  default: () => <nav aria-label="Dashboard navigation" />,
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'admin@acme.com' } } })
})

describe('DashboardLayout', () => {
  it('redirects to /login when no session exists', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(DashboardLayout({ children: <div /> })).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('renders the logo, SettingsMenu, SignOutButton, and DashboardNav for authenticated users', async () => {
    render(await DashboardLayout({ children: <div /> }))
    expect(screen.getByRole('img', { name: 'Tendr' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Dashboard navigation' })).toBeInTheDocument()
  })

  it('renders children inside a main element', async () => {
    render(await DashboardLayout({ children: <p>page content</p> }))
    expect(screen.getByRole('main')).toContainElement(screen.getByText('page content'))
  })
})
