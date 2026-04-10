import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// The page assembles all sections — this test verifies the full page structure
describe('Home page', () => {
  it('renders without crashing', () => {
    render(<Home />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders the main landmark', () => {
    render(<Home />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders navigation', () => {
    render(<Home />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(<Home />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders the hero headline', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders all section anchors for in-page navigation', () => {
    render(<Home />)
    expect(document.getElementById('how-it-works')).toBeInTheDocument()
    expect(document.getElementById('features')).toBeInTheDocument()
    expect(document.getElementById('pricing')).toBeInTheDocument()
    expect(document.getElementById('faq')).toBeInTheDocument()
    expect(document.getElementById('contact')).toBeInTheDocument()
  })

  it('renders at least one Book a Demo CTA', () => {
    render(<Home />)
    const ctaLinks = screen.getAllByRole('link', { name: 'Book a Demo' })
    expect(ctaLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('page contains multiple section headings', () => {
    render(<Home />)
    const h2s = screen.getAllByRole('heading', { level: 2 })
    // Hero (h1) + at least 5 section h2s: How It Works, Features, For Homeowners, Pricing, FAQ, CTA
    expect(h2s.length).toBeGreaterThanOrEqual(5)
  })

  it('does not render any broken "undefined" text', () => {
    render(<Home />)
    expect(screen.queryByText('undefined')).not.toBeInTheDocument()
  })
})
