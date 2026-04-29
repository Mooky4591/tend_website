import { render, screen } from '@testing-library/react'
import ConversationPanel from '@/app/dashboard/users/[id]/ConversationPanel'

beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
})

const MESSAGES = [
  { id: 'm1', role: 'user' as const, content: 'Hello there', created_at: '2026-06-01T10:00:00Z' },
  { id: 'm2', role: 'assistant' as const, content: 'Hi! How can I help?', created_at: '2026-06-01T10:01:00Z' },
  { id: 'm3', role: 'staff' as const, content: 'Staff chiming in', created_at: '2026-06-01T10:02:00Z' },
]

describe('ConversationPanel', () => {
  it('shows empty state when there are no messages', () => {
    render(<ConversationPanel messages={[]} />)
    expect(screen.getByText('No messages yet')).toBeInTheDocument()
  })

  it('renders all message contents', () => {
    render(<ConversationPanel messages={MESSAGES} />)
    expect(screen.getByText('Hello there')).toBeInTheDocument()
    expect(screen.getByText('Hi! How can I help?')).toBeInTheDocument()
    expect(screen.getByText('Staff chiming in')).toBeInTheDocument()
  })

  it('applies slate bubble style to user messages', () => {
    render(<ConversationPanel messages={[MESSAGES[0]]} />)
    expect(screen.getByText('Hello there').className).toContain('bg-slate-100')
  })

  it('applies emerald bubble style to assistant messages', () => {
    render(<ConversationPanel messages={[MESSAGES[1]]} />)
    expect(screen.getByText('Hi! How can I help?').className).toContain('bg-emerald-600')
  })

  it('applies blue bubble style to staff messages and shows Staff label', () => {
    render(<ConversationPanel messages={[MESSAGES[2]]} />)
    expect(screen.getByText('Staff chiming in').className).toContain('bg-blue-600')
    expect(screen.getByText('Staff')).toBeInTheDocument()
  })

  it('does not show Staff label for user or assistant messages', () => {
    render(<ConversationPanel messages={[MESSAGES[0], MESSAGES[1]]} />)
    expect(screen.queryByText('Staff')).not.toBeInTheDocument()
  })

  it('calls scrollIntoView on mount', () => {
    render(<ConversationPanel messages={MESSAGES} />)
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled()
  })
})
