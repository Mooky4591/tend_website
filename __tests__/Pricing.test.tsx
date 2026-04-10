import { render, screen } from '@testing-library/react'
import Pricing from '@/components/Pricing'

describe('Pricing', () => {
  it('renders the section heading', () => {
    render(<Pricing />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('section has the pricing id for anchor navigation', () => {
    render(<Pricing />)
    expect(document.getElementById('pricing')).toBeInTheDocument()
  })

  it('heading communicates the per-active-user model', () => {
    render(<Pricing />)
    const h2 = screen.getByRole('heading', { level: 2 })
    expect(h2.textContent).toMatch(/actually using it/i)
  })

  it('body copy explains the per-active-user model', () => {
    render(<Pricing />)
    expect(screen.getByText(/per active user, per month/i)).toBeInTheDocument()
  })

  it('renders the Pay per active user highlight', () => {
    render(<Pricing />)
    expect(screen.getByText('Pay per active user')).toBeInTheDocument()
  })

  it('renders the Scales with your business highlight', () => {
    render(<Pricing />)
    expect(screen.getByText('Scales with your business')).toBeInTheDocument()
  })

  it('renders the Everything included highlight', () => {
    render(<Pricing />)
    expect(screen.getByText('Everything included')).toBeInTheDocument()
  })

  it('explains that inactive users do not count', () => {
    render(<Pricing />)
    expect(screen.getByText(/Inactive or unresponsive users don/i)).toBeInTheDocument()
  })

  it('renders a contact CTA link pointing to #contact', () => {
    render(<Pricing />)
    expect(screen.getByRole('link', { name: /Contact us for a quote/i })).toHaveAttribute('href', '#contact')
  })

  it('does not display any specific prices', () => {
    render(<Pricing />)
    expect(screen.queryByText(/\$\d/)).not.toBeInTheDocument()
  })

  it('does not mention tiers like Starter, Growth, or Enterprise', () => {
    render(<Pricing />)
    expect(screen.queryByText('Starter')).not.toBeInTheDocument()
    expect(screen.queryByText('Growth')).not.toBeInTheDocument()
    expect(screen.queryByText('Enterprise')).not.toBeInTheDocument()
  })
})
