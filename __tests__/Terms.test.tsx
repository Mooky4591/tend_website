import { render, screen } from '@testing-library/react'
import TermsPage from '@/app/terms/page'

describe('TermsPage', () => {
  it('renders the Terms of Use heading', () => {
    render(<TermsPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Terms of Use/i)
  })

  it('renders within a main landmark', () => {
    render(<TermsPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders a support email link', () => {
    render(<TermsPage />)
    const emailLinks = screen.getAllByRole('link', { name: /support@trytendr\.org/i })
    expect(emailLinks[0]).toHaveAttribute('href', 'mailto:support@trytendr.org')
  })
})
