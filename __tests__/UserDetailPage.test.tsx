import { render, screen } from '@testing-library/react'
import UserDetailPage from '@/app/dashboard/users/[id]/page'

const mockRedirect = jest.fn()
const mockNotFound = jest.fn()
const mockGetUser = jest.fn()
const mockUserSingle = jest.fn()
const mockConvsOrder = jest.fn()
const mockRemindersOrder = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (path: string) => { mockRedirect(path); throw new Error(`NEXT_REDIRECT:${path}`) },
  notFound: () => { mockNotFound(); throw new Error('NOT_FOUND') },
}))

jest.mock('next/link', () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>
  MockLink.displayName = 'Link'
  return MockLink
})

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'users') {
        return { select: () => ({ eq: () => ({ single: mockUserSingle }) }) }
      }
      if (table === 'conversations') {
        return { select: () => ({ eq: () => ({ order: mockConvsOrder }) }) }
      }
      if (table === 'reminders') {
        return { select: () => ({ eq: () => ({ order: mockRemindersOrder }) }) }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  }),
}))

jest.mock('@/app/dashboard/users/[id]/ConversationPanel', () => {
  const ConversationPanel = () => <div data-testid="conversation-panel" />
  ConversationPanel.displayName = 'ConversationPanel'
  return ConversationPanel
})

jest.mock('@/app/dashboard/users/[id]/MessageForm', () => {
  const MessageForm = () => <div data-testid="message-form" />
  MessageForm.displayName = 'MessageForm'
  return MessageForm
})

jest.mock('@/app/dashboard/users/[id]/RemindersPanel', () => {
  const RemindersPanel = () => <div data-testid="reminders-panel" />
  RemindersPanel.displayName = 'RemindersPanel'
  return RemindersPanel
})

const HOMEOWNER = {
  id: 'u1',
  first_name: 'Alice',
  phone_number: '+15551234567',
  address: '123 Main St',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
  onboarding_complete: true,
  opted_out: false,
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'staff-1' } } })
  mockUserSingle.mockResolvedValue({ data: HOMEOWNER })
  mockConvsOrder.mockResolvedValue({ data: [] })
  mockRemindersOrder.mockResolvedValue({ data: [] })
})

describe('UserDetailPage', () => {
  it('redirects to /login when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(UserDetailPage({ params: { id: 'u1' } })).rejects.toThrow('NEXT_REDIRECT:/login')
  })

  it('calls notFound when the homeowner does not exist', async () => {
    mockUserSingle.mockResolvedValueOnce({ data: null })
    await expect(UserDetailPage({ params: { id: 'nonexistent' } })).rejects.toThrow('NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalled()
  })

  it('renders the homeowner name and phone number', async () => {
    render(await UserDetailPage({ params: { id: 'u1' } }))
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('+15551234567')).toBeInTheDocument()
  })

  it('renders the full address when all location fields are present', async () => {
    render(await UserDetailPage({ params: { id: 'u1' } }))
    expect(screen.getByText('123 Main St, Austin, TX, 78701')).toBeInTheDocument()
  })

  it('omits the address line when location fields are null', async () => {
    mockUserSingle.mockResolvedValueOnce({
      data: { ...HOMEOWNER, address: null, city: null, state: null, zip: null },
    })
    render(await UserDetailPage({ params: { id: 'u1' } }))
    expect(screen.queryByText(/Main St/)).not.toBeInTheDocument()
  })

  it('shows the Onboarding complete badge when applicable', async () => {
    render(await UserDetailPage({ params: { id: 'u1' } }))
    expect(screen.getByText('Onboarding complete')).toBeInTheDocument()
  })

  it('does not show the Onboarding complete badge when false', async () => {
    mockUserSingle.mockResolvedValueOnce({ data: { ...HOMEOWNER, onboarding_complete: false } })
    render(await UserDetailPage({ params: { id: 'u1' } }))
    expect(screen.queryByText('Onboarding complete')).not.toBeInTheDocument()
  })

  it('shows the Opted out badge when applicable', async () => {
    mockUserSingle.mockResolvedValueOnce({ data: { ...HOMEOWNER, opted_out: true } })
    render(await UserDetailPage({ params: { id: 'u1' } }))
    expect(screen.getByText('Opted out')).toBeInTheDocument()
  })

  it('falls back to Homeowner when first_name is null', async () => {
    mockUserSingle.mockResolvedValueOnce({ data: { ...HOMEOWNER, first_name: null } })
    render(await UserDetailPage({ params: { id: 'u1' } }))
    expect(screen.getByRole('heading', { name: 'Homeowner' })).toBeInTheDocument()
  })

  it('renders ConversationPanel, MessageForm, and RemindersPanel', async () => {
    render(await UserDetailPage({ params: { id: 'u1' } }))
    expect(screen.getByTestId('conversation-panel')).toBeInTheDocument()
    expect(screen.getByTestId('message-form')).toBeInTheDocument()
    expect(screen.getByTestId('reminders-panel')).toBeInTheDocument()
  })

  it('handles null conversations and reminders responses without crashing', async () => {
    mockConvsOrder.mockResolvedValueOnce({ data: null })
    mockRemindersOrder.mockResolvedValueOnce({ data: null })
    render(await UserDetailPage({ params: { id: 'u1' } }))
    expect(screen.getByTestId('conversation-panel')).toBeInTheDocument()
    expect(screen.getByTestId('reminders-panel')).toBeInTheDocument()
  })
})
