import { render, screen } from '@testing-library/react'
import Features from '@/components/Features'

const expectedFeatureTitles = [
  'Conversational Onboarding',
  'Proactive Maintenance Reminders',
  'Instant Warranty Answers',
  'Built for Multiple Companies',
  'SMS Compliance Built In',
  'Billing & Usage Insights',
]

describe('Features', () => {
  it('renders the section heading', () => {
    render(<Features />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('section has the features id for anchor navigation', () => {
    render(<Features />)
    expect(document.getElementById('features')).toBeInTheDocument()
  })

  it('renders all six feature card titles', () => {
    render(<Features />)
    expectedFeatureTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
  })

  it('renders six feature cards', () => {
    render(<Features />)
    // Each card has a unique heading inside it
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(6)
  })

  it('Conversational Onboarding card mentions free-text parsing', () => {
    render(<Features />)
    expect(screen.getByText(/plain English/i)).toBeInTheDocument()
  })

  it('Proactive Maintenance Reminders card mentions 30+ types and purchase links', () => {
    render(<Features />)
    expect(screen.getByText(/30\+ reminder types/i)).toBeInTheDocument()
    expect(screen.getByText(/direct link to purchase/i)).toBeInTheDocument()
  })

  it('Instant Warranty Answers card mentions semantic search', () => {
    render(<Features />)
    expect(screen.getByText(/semantic search/i)).toBeInTheDocument()
  })

  it('SMS Compliance card mentions STOP keyword', () => {
    render(<Features />)
    expect(screen.getByText(/STOP/)).toBeInTheDocument()
  })

  it('Built for Multiple Companies card mentions dedicated phone number', () => {
    render(<Features />)
    expect(screen.getByText(/dedicated phone number/i)).toBeInTheDocument()
  })

  it('Billing card mentions monthly snapshots per warranty company', () => {
    render(<Features />)
    expect(screen.getByText(/Monthly snapshots/i)).toBeInTheDocument()
    expect(screen.getByText(/per warranty company/i)).toBeInTheDocument()
  })
})
