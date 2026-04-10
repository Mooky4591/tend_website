import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navigation from '@/components/Navigation'

describe('Navigation', () => {
  it('renders the Tend brand name', () => {
    render(<Navigation />)
    expect(screen.getByText('Tend')).toBeInTheDocument()
  })

  it('renders all desktop nav link labels', () => {
    render(<Navigation />)
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('How It Works')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('FAQ')).toBeInTheDocument()
  })

  it('nav links point to correct section anchors', () => {
    render(<Navigation />)
    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '#features')
    expect(screen.getByRole('link', { name: 'How It Works' })).toHaveAttribute('href', '#how-it-works')
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '#pricing')
    expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '#faq')
  })

  it('Book a Demo links point to #contact', () => {
    render(<Navigation />)
    const ctaLinks = screen.getAllByRole('link', { name: 'Book a Demo' })
    expect(ctaLinks.length).toBeGreaterThanOrEqual(1)
    ctaLinks.forEach((link) => expect(link).toHaveAttribute('href', '#contact'))
  })

  it('logo link has an accessible label', () => {
    render(<Navigation />)
    expect(screen.getByRole('link', { name: 'Tend — go to homepage' })).toBeInTheDocument()
  })

  it('renders a toggle button for mobile navigation', () => {
    render(<Navigation />)
    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toBeInTheDocument()
  })

  it('hamburger button starts with aria-expanded=false', () => {
    render(<Navigation />)
    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('mobile menu opens when hamburger is clicked', async () => {
    const user = userEvent.setup()
    render(<Navigation />)

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))

    const mobileMenu = document.getElementById('mobile-menu')
    expect(mobileMenu).toBeInTheDocument()
  })

  it('hamburger aria-expanded becomes true when menu is open', async () => {
    const user = userEvent.setup()
    render(<Navigation />)

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))

    expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  it('mobile menu closes when a nav link is clicked', async () => {
    const user = userEvent.setup()
    render(<Navigation />)

    // Open menu
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    expect(document.getElementById('mobile-menu')).toBeInTheDocument()

    // Click the last "Features" link (the mobile one)
    const allFeaturesLinks = screen.getAllByText('Features')
    await user.click(allFeaturesLinks[allFeaturesLinks.length - 1])

    expect(document.getElementById('mobile-menu')).not.toBeInTheDocument()
  })

  it('mobile menu closes when the Book a Demo link is clicked', async () => {
    const user = userEvent.setup()
    render(<Navigation />)

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    expect(document.getElementById('mobile-menu')).toBeInTheDocument()

    const allDemoLinks = screen.getAllByText('Book a Demo')
    await user.click(allDemoLinks[allDemoLinks.length - 1])

    expect(document.getElementById('mobile-menu')).not.toBeInTheDocument()
  })

  it('menu toggles back to closed when hamburger is clicked again', async () => {
    const user = userEvent.setup()
    render(<Navigation />)

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    expect(document.getElementById('mobile-menu')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close navigation menu' }))
    expect(document.getElementById('mobile-menu')).not.toBeInTheDocument()
  })

  it('header has the correct banner role', () => {
    render(<Navigation />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('main nav has an accessible label', () => {
    render(<Navigation />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })
})
