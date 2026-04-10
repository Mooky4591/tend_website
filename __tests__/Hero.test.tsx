import { render, screen } from '@testing-library/react'
import Hero from '@/components/Hero'

describe('Hero', () => {
  it('renders the main headline', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('headline contains key brand message', () => {
    render(<Hero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1.textContent).toMatch(/homeowners/i)
  })

  it('renders the subheadline with SMS mention', () => {
    render(<Hero />)
    // SMS appears in multiple elements (badge + body text) — just verify at least one is present
    expect(screen.getAllByText(/SMS/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders a Book a Demo CTA link pointing to #contact', () => {
    render(<Hero />)
    const cta = screen.getByRole('link', { name: 'Book a Demo' })
    expect(cta).toHaveAttribute('href', '#contact')
  })

  it('renders a See How It Works link pointing to #how-it-works', () => {
    render(<Hero />)
    const link = screen.getByRole('link', { name: /See How It Works/i })
    expect(link).toHaveAttribute('href', '#how-it-works')
  })

  it('phone mockup has an accessible role and label', () => {
    render(<Hero />)
    expect(screen.getByRole('img', { name: /SMS conversation/i })).toBeInTheDocument()
  })

  it('renders the section landmark with the hero heading', () => {
    render(<Hero />)
    // The section is aria-labelledby="hero-headline" whose text contains "homeowners"
    const section = screen.getByRole('region', { name: /homeowners deserve/i })
    expect(section).toBeInTheDocument()
  })

  it('renders the no-commitment disclaimer text', () => {
    render(<Hero />)
    expect(screen.getByText(/No commitment required/i)).toBeInTheDocument()
  })

  it('renders the SMS badge in the hero', () => {
    render(<Hero />)
    expect(screen.getByText(/No App Required/i)).toBeInTheDocument()
  })
})
