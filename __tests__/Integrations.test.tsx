import { render, screen } from '@testing-library/react'
import Integrations from '@/components/Integrations'

const expectedIntegrations = [
  { name: 'SMS Infrastructure', role: 'Carrier-grade message delivery' },
  { name: 'Anthropic Claude', role: 'AI generation & parsing' },
  { name: 'OpenAI', role: 'Semantic search embeddings' },
  { name: 'ATTOM Data', role: 'Property enrichment' },
  { name: 'Supabase', role: 'Database & vector search' },
]

describe('Integrations', () => {
  it('renders the section heading', () => {
    render(<Integrations />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('heading mentions trusted infrastructure', () => {
    render(<Integrations />)
    expect(screen.getByText(/Built on infrastructure you can trust/i)).toBeInTheDocument()
  })

  it('renders all five integration names', () => {
    render(<Integrations />)
    expectedIntegrations.forEach(({ name }) => {
      expect(screen.getByText(name)).toBeInTheDocument()
    })
  })

  it('renders all integration role descriptions', () => {
    render(<Integrations />)
    expectedIntegrations.forEach(({ role }) => {
      expect(screen.getByText(role)).toBeInTheDocument()
    })
  })

  it('integration list has accessible list role', () => {
    render(<Integrations />)
    expect(screen.getByRole('list', { name: /Technology partners/i })).toBeInTheDocument()
  })

  it('renders five integration list items', () => {
    render(<Integrations />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(5)
  })
})
