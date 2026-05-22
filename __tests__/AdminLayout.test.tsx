import { render, screen } from '@testing-library/react'

// ─── Mocks ─────────────────────────────────────────────────────────────────
// Use nested closures so that const variables are not captured in the factory
// body at hoist-time (TDZ-safe pattern).

const mockRedirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: (path: string) => { mockRedirect(path); throw new Error(`NEXT_REDIRECT:${path}`) },
}))

const mockIsAdminAuthenticated = jest.fn()
jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: () => mockIsAdminAuthenticated(),
}))

const mockHeadersGet = jest.fn()
jest.mock('next/headers', () => ({
  headers: () => ({ get: (key: string) => mockHeadersGet(key) }),
}))

// ─── Module import (safe: after jest.mock hoisting) ──────────────────────────
import AdminLayout from '@/app/admin/layout'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setPathname(pathname: string) {
  mockHeadersGet.mockImplementation((key: string) =>
    key === 'x-pathname' ? pathname : null,
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  mockIsAdminAuthenticated.mockReturnValue(false)
  mockHeadersGet.mockReturnValue(null)
})

describe('AdminLayout — authentication guard', () => {
  it('redirects to /admin/login when unauthenticated on a protected page', () => {
    setPathname('/admin/alerts')
    expect(() => AdminLayout({ children: <div /> })).toThrow('NEXT_REDIRECT:/admin/login')
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
  })

  it('does NOT redirect on /admin/login even when unauthenticated (prevents login loop)', () => {
    setPathname('/admin/login')
    mockIsAdminAuthenticated.mockReturnValue(false)
    expect(() => AdminLayout({ children: <div /> })).not.toThrow()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('does NOT redirect when authenticated on a protected page', () => {
    setPathname('/admin/alerts')
    mockIsAdminAuthenticated.mockReturnValue(true)
    expect(() => AdminLayout({ children: <div /> })).not.toThrow()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})

describe('AdminLayout — navigation', () => {
  beforeEach(() => {
    setPathname('/admin')
    mockIsAdminAuthenticated.mockReturnValue(true)
  })

  it('renders navigation links to all admin pages', () => {
    render(AdminLayout({ children: <div /> }))
    expect(screen.getByText('📊 Dashboard')).toBeInTheDocument()
    expect(screen.getByText('💬 Conversations')).toBeInTheDocument()
    expect(screen.getByText('🔍 Onboarding Gaps')).toBeInTheDocument()
    expect(screen.getByText('🚨 Alerts')).toBeInTheDocument()
    expect(screen.getByText('👤 Users')).toBeInTheDocument()
  })

  it('renders a logout form that POSTs to /api/admin/auth', () => {
    render(AdminLayout({ children: <div /> }))
    const form = document.querySelector('form[action="/api/admin/auth"]')
    expect(form).toBeInTheDocument()
    expect(form?.querySelector('input[name="action"][value="logout"]')).toBeInTheDocument()
  })

  it('renders children in the main content area', () => {
    render(AdminLayout({ children: <p>page content</p> }))
    expect(screen.getByText('page content')).toBeInTheDocument()
  })
})
