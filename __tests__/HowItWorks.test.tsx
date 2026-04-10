import { render, screen } from '@testing-library/react'
import HowItWorks from '@/components/HowItWorks'

describe('HowItWorks', () => {
  it('renders the section heading', () => {
    render(<HowItWorks />)
    expect(
      screen.getByRole('heading', { level: 2, name: /three steps/i })
    ).toBeInTheDocument()
  })

  it('renders all three step headings', () => {
    render(<HowItWorks />)
    expect(screen.getByText('Connect your homeowners')).toBeInTheDocument()
    expect(screen.getByText('Tend handles onboarding')).toBeInTheDocument()
    expect(screen.getByText('Automated value, forever')).toBeInTheDocument()
  })

  it('renders step numbers 01, 02, 03', () => {
    render(<HowItWorks />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('section has the how-it-works id for anchor navigation', () => {
    render(<HowItWorks />)
    const section = document.getElementById('how-it-works')
    expect(section).toBeInTheDocument()
  })

  it('renders the section label tag', () => {
    render(<HowItWorks />)
    expect(screen.getByText('How it works')).toBeInTheDocument()
  })

  it('mentions webhook and CSV import in step 1', () => {
    render(<HowItWorks />)
    expect(screen.getByText(/webhook/i)).toBeInTheDocument()
    expect(screen.getByText(/CSV/i)).toBeInTheDocument()
  })

  it('mentions ATTOM property data in step 2', () => {
    render(<HowItWorks />)
    expect(screen.getByText(/ATTOM/i)).toBeInTheDocument()
  })

  it('mentions maintenance reminders and warranty in step 3', () => {
    render(<HowItWorks />)
    // "warranty" appears in multiple paragraphs across steps; verify at least one match
    expect(screen.getAllByText(/maintenance reminders/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/warranty/i).length).toBeGreaterThanOrEqual(1)
  })
})
