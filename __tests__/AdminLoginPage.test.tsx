import { render, screen } from '@testing-library/react'

// Mock admin-auth
jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: jest.fn().mockReturnValue(false),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

import { isAdminAuthenticated } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'

describe('AdminLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(isAdminAuthenticated as jest.Mock).mockReturnValue(false)
  })

  it('renders a password input and submit button', async () => {
    const { default: AdminLoginPage } = await import('@/app/admin/login/page')
    render(<AdminLoginPage searchParams={{}} />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('renders error message when searchParams.error is set', async () => {
    const { default: AdminLoginPage } = await import('@/app/admin/login/page')
    render(<AdminLoginPage searchParams={{ error: 'Incorrect password' }} />)
    expect(screen.getByText('Incorrect password')).toBeInTheDocument()
  })

  it('does not render error when searchParams.error is absent', async () => {
    const { default: AdminLoginPage } = await import('@/app/admin/login/page')
    render(<AdminLoginPage searchParams={{}} />)
    expect(screen.queryByText('Incorrect password')).not.toBeInTheDocument()
  })

  it('form action points to /api/admin/auth', async () => {
    const { default: AdminLoginPage } = await import('@/app/admin/login/page')
    render(<AdminLoginPage searchParams={{}} />)
    const form = document.querySelector('form')!
    expect(form.getAttribute('action')).toBe('/api/admin/auth')
  })

  it('redirects to /admin when already authenticated', async () => {
    ;(isAdminAuthenticated as jest.Mock).mockReturnValue(true)
    const { default: AdminLoginPage } = await import('@/app/admin/login/page')
    render(<AdminLoginPage searchParams={{}} />)
    expect(redirect).toHaveBeenCalledWith('/admin')
  })
})
