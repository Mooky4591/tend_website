import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

describe('Footer', () => {
  it('renders with contentinfo role', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders the Tendr brand name', () => {
    render(<Footer />)
    expect(screen.getByText('Tendr')).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Footer />)
    expect(screen.getByText(/AI-powered home care/i)).toBeInTheDocument()
  })

  it('renders copyright notice', () => {
    render(<Footer />)
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument()
  })

  it('copyright year matches current year', () => {
    render(<Footer />)
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
  })

  it('renders all product nav links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Features' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'How It Works' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pricing' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'FAQ' })).toBeInTheDocument()
  })

  it('product links point to correct section anchors', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '#features')
    expect(screen.getByRole('link', { name: 'How It Works' })).toHaveAttribute('href', '#how-it-works')
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '#pricing')
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '#faq')
  })

  it('renders company nav links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument()
  })

  it('renders legal links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument()
  })

  it('legal links point to the real policy URLs', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      'https://app.termly.io/policy-viewer/policy.html?policyUUID=6807f094-d6d5-4171-a4d9-1aafa1eebeb8'
    )
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute(
      'href',
      'https://docs.google.com/document/d/e/2PACX-1vR0r80pzdX_Rl9l0hqtbGXwU0agJad8lgfU0r24Wht6tOpIebwzi8Q9XSBsN0h1_M0HDABfY4sIKgb2/pub'
    )
  })

  it('legal links open in a new tab with safe rel attribute', () => {
    render(<Footer />)
    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' })
    const tosLink = screen.getByRole('link', { name: 'Terms of Service' })
    expect(privacyLink).toHaveAttribute('target', '_blank')
    expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(tosLink).toHaveAttribute('target', '_blank')
    expect(tosLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('has labelled navigation regions', () => {
    render(<Footer />)
    expect(screen.getByRole('navigation', { name: 'Product links' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Company links' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Legal links' })).toBeInTheDocument()
  })
})
