import { render, screen } from '@testing-library/react'
import PrivacyPolicyPage from '@/app/privacy-policy/page'

describe('PrivacyPolicyPage', () => {
  it('renders the Privacy Policy heading', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeInTheDocument()
  })

  it('renders within a main landmark', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders key section headings', () => {
    render(<PrivacyPolicyPage />)
    const headings = screen.getAllByRole('heading', { level: 2 })
    const headingTexts = headings.map(h => h.textContent ?? '')
    expect(headingTexts.some(t => /What Information Do We Collect/.test(t))).toBe(true)
    expect(headingTexts.some(t => /SMS Messaging/.test(t))).toBe(true)
  })

  it('renders a support email link', () => {
    render(<PrivacyPolicyPage />)
    const emailLinks = screen.getAllByRole('link', { name: /support@trytendr\.org/i })
    expect(emailLinks[0]).toHaveAttribute('href', 'mailto:support@trytendr.org')
  })
})
