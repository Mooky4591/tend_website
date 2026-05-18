import { render, screen, waitFor, act } from '@testing-library/react'
import DashboardContent from '@/app/dashboard/DashboardContent'

const PAGE_SIZE = 1000

const mockUsersRange = jest.fn()
const mockUsersOrder = jest.fn()
const usersChain = { order: mockUsersOrder, range: mockUsersRange }
mockUsersOrder.mockReturnValue(usersChain)
const mockUsersEq = jest.fn(() => usersChain)

const mockConversationsRange = jest.fn()
const mockConversationsOrder = jest.fn()
const conversationsChain = { order: mockConversationsOrder, range: mockConversationsRange }
mockConversationsOrder.mockReturnValue(conversationsChain)
const mockConversationsEq = jest.fn(() => conversationsChain)
const mockRemoveChannel = jest.fn()
const realtimeCallbacks: Record<string, (...args: unknown[]) => void> = {}

jest.mock('@/app/dashboard/DashboardCharts', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-charts" />,
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => {
    const makeChannel = (name: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ch: any = {
        on: (_event: unknown, _config: unknown, callback: (...args: unknown[]) => void) => {
          realtimeCallbacks[name] = callback
          return ch
        },
        subscribe: jest.fn(),
      }
      ch.subscribe.mockReturnValue(ch)
      return ch
    }
    return {
      from: (table: string) => {
        if (table === 'users') return { select: () => ({ eq: mockUsersEq }) }
        if (table === 'conversations') return { select: () => ({ eq: mockConversationsEq }) }
        throw new Error(`Unexpected table: ${table}`)
      },
      channel: makeChannel,
      removeChannel: mockRemoveChannel,
    }
  },
}))

function makeUserRows(n: number, base = '2026-01') {
  return Array.from({ length: n }, (_, i) => ({
    created_at: `${base}-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z`,
    onboarding_complete: false,
    opted_out: false,
  }))
}

function makeConversationRows(n: number, base = '2026-01') {
  return Array.from({ length: n }, (_, i) => ({
    created_at: `${base}-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z`,
  }))
}

beforeEach(() => {
  jest.clearAllMocks()
  Object.keys(realtimeCallbacks).forEach(k => delete realtimeCallbacks[k])
  mockUsersOrder.mockReturnValue(usersChain)
  mockConversationsOrder.mockReturnValue(conversationsChain)
  mockUsersRange.mockResolvedValue({ data: [] })
  mockConversationsRange.mockResolvedValue({ data: [] })
})

describe('DashboardContent', () => {
  it('renders without crashing', async () => {
    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })
    expect(screen.getByText('Total homeowners')).toBeInTheDocument()
    expect(screen.getByText('Completed Onboarding')).toBeInTheDocument()
    expect(screen.getByText('Opted out')).toBeInTheDocument()
  })

  it('displays zero counts when users query returns empty', async () => {
    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })
    await waitFor(() => {
      expect(screen.getAllByText('0')).toHaveLength(3)
    })
  })

  it('displays correct stat counts from fetched data', async () => {
    mockUsersRange.mockResolvedValueOnce({
      data: [
        { created_at: '2026-01-15T00:00:00Z', onboarding_complete: true, opted_out: false },
        { created_at: '2026-02-10T00:00:00Z', onboarding_complete: true, opted_out: false },
        { created_at: '2026-03-05T00:00:00Z', onboarding_complete: false, opted_out: true },
        { created_at: '2026-04-20T00:00:00Z', onboarding_complete: false, opted_out: false },
      ],
    })

    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })

    await waitFor(() => {
      expect(screen.getByText('Total homeowners').closest('div')).toHaveTextContent('4')
      expect(screen.getByText('Completed Onboarding').closest('div')).toHaveTextContent('2')
      expect(screen.getByText('Opted out').closest('div')).toHaveTextContent('1')
    })
  })

  it('handles null users response without crashing', async () => {
    mockUsersRange.mockResolvedValueOnce({ data: null })
    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })
    await waitFor(() => {
      expect(screen.getAllByText('0')).toHaveLength(3)
    })
  })

  it('handles null conversations response without crashing', async () => {
    mockConversationsRange.mockResolvedValueOnce({ data: null })
    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })
    expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument()
  })

  it('subscribes to realtime channels on mount', async () => {
    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })
    expect(realtimeCallbacks['users-changes']).toBeDefined()
    expect(realtimeCallbacks['conversations-changes']).toBeDefined()
  })

  it('re-fetches stats and updates the DOM when users realtime callback fires', async () => {
    mockUsersRange.mockResolvedValue({ data: [] })

    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })

    await waitFor(() => expect(screen.getAllByText('0')).toHaveLength(3))

    mockUsersRange.mockResolvedValue({
      data: [
        { created_at: '2026-01-15T00:00:00Z', onboarding_complete: true, opted_out: false },
        { created_at: '2026-02-15T00:00:00Z', onboarding_complete: false, opted_out: false },
        { created_at: '2026-03-15T00:00:00Z', onboarding_complete: false, opted_out: true },
      ],
    })

    await act(async () => {
      realtimeCallbacks['users-changes']?.()
    })

    await waitFor(() => {
      expect(screen.getByText('Total homeowners').closest('div')).toHaveTextContent('3')
    })
  })

  it('re-fetches messages when conversations realtime callback fires', async () => {
    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })

    expect(mockConversationsRange).toHaveBeenCalledTimes(1)

    await act(async () => {
      realtimeCallbacks['conversations-changes']?.()
    })

    expect(mockConversationsRange).toHaveBeenCalledTimes(2)
  })

  it('pages through users beyond the PostgREST row limit so stats reflect every row', async () => {
    mockUsersRange
      .mockResolvedValueOnce({ data: makeUserRows(PAGE_SIZE) })
      .mockResolvedValueOnce({ data: makeUserRows(250, '2026-02') })

    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })

    await waitFor(() => {
      expect(screen.getByText('Total homeowners').closest('div')).toHaveTextContent('1,250')
    })
    expect(mockUsersRange).toHaveBeenNthCalledWith(1, 0, PAGE_SIZE - 1)
    expect(mockUsersRange).toHaveBeenNthCalledWith(2, PAGE_SIZE, 2 * PAGE_SIZE - 1)
  })

  it('pages through conversations beyond the PostgREST row limit so the messages chart reflects every row', async () => {
    mockConversationsRange
      .mockResolvedValueOnce({ data: makeConversationRows(PAGE_SIZE) })
      .mockResolvedValueOnce({ data: makeConversationRows(42, '2026-02') })

    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })

    await waitFor(() => {
      expect(mockConversationsRange).toHaveBeenCalledTimes(2)
    })
    expect(mockConversationsRange).toHaveBeenNthCalledWith(1, 0, PAGE_SIZE - 1)
    expect(mockConversationsRange).toHaveBeenNthCalledWith(2, PAGE_SIZE, 2 * PAGE_SIZE - 1)
  })

  it('applies a deterministic order before paginating to keep page boundaries stable', async () => {
    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })

    await waitFor(() => {
      expect(mockUsersOrder).toHaveBeenCalledWith('created_at', { ascending: true })
      expect(mockUsersOrder).toHaveBeenCalledWith('id', { ascending: true })
      expect(mockConversationsOrder).toHaveBeenCalledWith('created_at', { ascending: true })
      expect(mockConversationsOrder).toHaveBeenCalledWith('id', { ascending: true })
    })
  })

  it('removes both channels on unmount', async () => {
    let unmount: () => void
    await act(async () => {
      const result = render(<DashboardContent tenantId="tenant-1" />)
      unmount = result.unmount
    })
    act(() => { unmount() })
    expect(mockRemoveChannel).toHaveBeenCalledTimes(2)
  })

  it('renders the DashboardCharts component', async () => {
    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })
    expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument()
  })

  it('stops paginating users on error and surfaces zero stats so a broken query never silently overcounts', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockUsersRange.mockResolvedValueOnce({ data: null, error: { message: 'rls denied' } })

    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })

    await waitFor(() => {
      expect(screen.getByText('Total homeowners').closest('div')).toHaveTextContent('0')
    })
    // A single call: pagination must abort on error rather than retrying or advancing offset
    expect(mockUsersRange).toHaveBeenCalledTimes(1)
    consoleSpy.mockRestore()
  })

  it('stops paginating conversations on error so a broken query never silently double-counts', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockConversationsRange.mockResolvedValueOnce({ data: null, error: { message: 'rls denied' } })

    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })

    await waitFor(() => {
      expect(mockConversationsRange).toHaveBeenCalledTimes(1)
    })
    consoleSpy.mockRestore()
  })
})
