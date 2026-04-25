import { render, screen } from '@testing-library/react'
import ForHomeowners from '@/components/ForHomeowners'

describe('ForHomeowners', () => {
  it('renders the section heading', () => {
    render(<ForHomeowners />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('heading mentions home assistant experience', () => {
    render(<ForHomeowners />)
    const h2 = screen.getByRole('heading', { level: 2 })
    expect(h2.textContent).toMatch(/home assistant experience/i)
  })

  it('renders all five benefit titles', () => {
    render(<ForHomeowners />)
    expect(screen.getByText('Natural language, not a chatbot')).toBeInTheDocument()
    expect(screen.getByText('Proactive reminders before things break')).toBeInTheDocument()
    expect(screen.getByText('Warranty answers in seconds')).toBeInTheDocument()
    expect(screen.getByText('Buy the part right from the reminder')).toBeInTheDocument()
    expect(screen.getByText('Photo support for appliance labels')).toBeInTheDocument()
  })

  it('purchase benefit mentions buying the part immediately', () => {
    render(<ForHomeowners />)
    expect(screen.getByText(/purchase the right part immediately/i)).toBeInTheDocument()
  })

  it('mentions no download requirement', () => {
    render(<ForHomeowners />)
    expect(screen.getByText(/download/i)).toBeInTheDocument()
  })

  it('renders example conversation section label', () => {
    render(<ForHomeowners />)
    expect(screen.getByText(/Example conversations/i)).toBeInTheDocument()
  })

  it('renders example warranty question', () => {
    render(<ForHomeowners />)
    // "compressor" appears in both the question and the answer bubbles
    expect(screen.getAllByText(/compressor/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders example filter question', () => {
    render(<ForHomeowners />)
    expect(screen.getByText(/HVAC filter/i)).toBeInTheDocument()
  })
})
