import { render, screen } from '@testing-library/react'
import Stats from '@/components/Stats'

describe('Stats', () => {
  it('renders the section landmark', () => {
    render(<Stats />)
    expect(screen.getByRole('region', { name: /Platform highlights/i })).toBeInTheDocument()
  })

  it('renders all four stat values', () => {
    render(<Stats />)
    expect(screen.getByText('30+')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('Multi-tenant')).toBeInTheDocument()
  })

  it('renders stat labels', () => {
    render(<Stats />)
    // Label is in the sr-only <dt> (announced once); the visible <span> carries aria-hidden="true"
    expect(screen.getAllByText('Maintenance reminder types').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Apps to download').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('TCPA compliant').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Architecture').length).toBeGreaterThanOrEqual(1)
  })

  it('renders stat detail descriptions', () => {
    render(<Stats />)
    expect(screen.getByText(/HVAC, plumbing, roof/i)).toBeInTheDocument()
    expect(screen.getByText(/nothing to install/i)).toBeInTheDocument()
    expect(screen.getByText(/STOP, START/i)).toBeInTheDocument()
    expect(screen.getByText(/Fully isolated/i)).toBeInTheDocument()
  })

  it('uses a definition list for stat items', () => {
    render(<Stats />)
    expect(screen.getAllByRole('term').length).toBeGreaterThanOrEqual(0)
    // Stats use dl/dt/dd structure
    const dl = document.querySelector('dl')
    expect(dl).toBeInTheDocument()
  })
})
