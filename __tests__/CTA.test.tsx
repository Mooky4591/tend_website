import { render, screen } from '@testing-library/react'
import CTA from '@/components/CTA'

describe('CTA', () => {
  it('renders the section heading', () => {
    render(<CTA />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('heading asks about readiness', () => {
    render(<CTA />)
    const h2 = screen.getByRole('heading', { level: 2 })
    expect(h2.textContent).toMatch(/Ready/i)
  })

  it('section has the contact id', () => {
    render(<CTA />)
    expect(document.getElementById('contact')).toBeInTheDocument()
  })

  it('renders a Book a Demo link', () => {
    render(<CTA />)
    expect(screen.getByRole('link', { name: 'Book a Demo' })).toBeInTheDocument()
  })

  it('renders a Contact Sales link', () => {
    render(<CTA />)
    expect(screen.getByRole('link', { name: 'Contact Sales' })).toBeInTheDocument()
  })

  it('renders the 30-minute demo description', () => {
    render(<CTA />)
    expect(screen.getByText(/30-minute demo/i)).toBeInTheDocument()
  })

  it('renders the no commitment disclaimer', () => {
    render(<CTA />)
    expect(screen.getByText(/No commitment required/i)).toBeInTheDocument()
  })

  it('Book a Demo link has a mailto or href set', () => {
    render(<CTA />)
    const link = screen.getByRole('link', { name: 'Book a Demo' })
    // The href should be set (either mailto: or a booking URL placeholder)
    expect(link.getAttribute('href')).toBeTruthy()
  })
})
