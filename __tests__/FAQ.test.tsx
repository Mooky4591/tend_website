import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FAQ from '@/components/FAQ'

const questions = [
  'Do homeowners need to download an app or create an account?',
  'How does Tend handle STOP and opt-out requests?',
  'Can I upload my own warranty documents?',
  "What happens if a homeowner doesn't respond during onboarding?",
  'How is data kept separate between different warranty companies?',
  "What happens if the AI can't answer a homeowner's question?",
  'Can Tend handle homes with multiple HVAC units?',
]

describe('FAQ', () => {
  it('renders the section heading', () => {
    render(<FAQ />)
    expect(screen.getByRole('heading', { level: 2, name: /Common questions/i })).toBeInTheDocument()
  })

  it('section has the faq id for anchor navigation', () => {
    render(<FAQ />)
    expect(document.getElementById('faq')).toBeInTheDocument()
  })

  it('renders all FAQ question buttons', () => {
    render(<FAQ />)
    questions.forEach((question) => {
      expect(screen.getByRole('button', { name: new RegExp(question, 'i') })).toBeInTheDocument()
    })
  })

  it('all answers are hidden by default', () => {
    render(<FAQ />)
    // All answer regions are hidden via the hidden attribute
    const regions = document.querySelectorAll('[role="region"][hidden]')
    expect(regions.length).toBe(questions.length)
  })

  it('all toggle buttons start with aria-expanded=false', () => {
    render(<FAQ />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('clicking a question reveals its answer', async () => {
    const user = userEvent.setup()
    render(<FAQ />)

    const firstButton = screen.getByRole('button', {
      name: /Do homeowners need to download/i,
    })
    await user.click(firstButton)

    expect(firstButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/No\. Tend works entirely over SMS/i)).toBeVisible()
  })

  it('clicking a question twice collapses it', async () => {
    const user = userEvent.setup()
    render(<FAQ />)

    const button = screen.getByRole('button', { name: /Do homeowners need to download/i })
    await user.click(button)
    await user.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('STOP answer mentions carrier-level compliance', async () => {
    const user = userEvent.setup()
    render(<FAQ />)

    await user.click(screen.getByRole('button', { name: /STOP and opt-out/i }))

    expect(screen.getByText(/carrier-level compliance is handled automatically/i)).toBeVisible()
  })

  it('warranty document answer mentions vector embeddings', async () => {
    const user = userEvent.setup()
    render(<FAQ />)

    await user.click(screen.getByRole('button', { name: /upload my own warranty/i }))

    expect(screen.getByText(/vector embeddings/i)).toBeVisible()
  })

  it('tenant isolation answer mentions dedicated phone number', async () => {
    const user = userEvent.setup()
    render(<FAQ />)

    await user.click(screen.getByRole('button', { name: /data kept separate/i }))

    expect(screen.getByText(/dedicated phone number/i)).toBeVisible()
  })

  it('multiple questions can be open simultaneously', async () => {
    const user = userEvent.setup()
    render(<FAQ />)

    await user.click(screen.getByRole('button', { name: /Do homeowners need to download/i }))
    await user.click(screen.getByRole('button', { name: /STOP and opt-out/i }))

    const openButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.getAttribute('aria-expanded') === 'true')
    expect(openButtons).toHaveLength(2)
  })

  it('renders an "Ask us directly" link pointing to #contact', () => {
    render(<FAQ />)
    expect(screen.getByRole('link', { name: /Ask us directly/i })).toHaveAttribute('href', '#contact')
  })
})
