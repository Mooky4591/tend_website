import { render, screen } from '@testing-library/react'
import DashboardNav from '@/app/dashboard/DashboardNav'

const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

jest.mock('next/link', () => {
  const MockLink = ({ href, children, className }: { href: string; children: React.ReactNode; className: string }) => (
    <a href={href} className={className}>{children}</a>
  )
  MockLink.displayName = 'Link'
  return MockLink
})

describe('DashboardNav', () => {
  it('renders all four tabs', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<DashboardNav />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Billing')).toBeInTheDocument()
    expect(screen.getByText('Warranty Docs')).toBeInTheDocument()
  })

  it('marks Overview as active when pathname is exactly /dashboard', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<DashboardNav />)
    expect(screen.getByText('Overview').closest('a')?.className).toContain('border-slate-900')
    expect(screen.getByText('Users').closest('a')?.className).not.toContain('border-slate-900')
  })

  it('does not mark Overview as active on /dashboard/users', () => {
    mockUsePathname.mockReturnValue('/dashboard/users')
    render(<DashboardNav />)
    expect(screen.getByText('Overview').closest('a')?.className).not.toContain('border-slate-900')
  })

  it('marks Users as active when pathname starts with /dashboard/users', () => {
    mockUsePathname.mockReturnValue('/dashboard/users/abc-123')
    render(<DashboardNav />)
    expect(screen.getByText('Users').closest('a')?.className).toContain('border-slate-900')
  })

  it('marks Billing as active when pathname starts with /dashboard/billing', () => {
    mockUsePathname.mockReturnValue('/dashboard/billing')
    render(<DashboardNav />)
    expect(screen.getByText('Billing').closest('a')?.className).toContain('border-slate-900')
  })

  it('marks Warranty Docs as active when pathname starts with /dashboard/docs', () => {
    mockUsePathname.mockReturnValue('/dashboard/docs')
    render(<DashboardNav />)
    expect(screen.getByText('Warranty Docs').closest('a')?.className).toContain('border-slate-900')
  })

  it('applies inactive styles to non-active tabs', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<DashboardNav />)
    expect(screen.getByText('Users').closest('a')?.className).toContain('border-transparent')
  })
})
