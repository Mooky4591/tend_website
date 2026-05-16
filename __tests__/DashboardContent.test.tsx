import { render, screen, waitFor, act } from '@testing-library/react'
import DashboardContent from '@/app/dashboard/DashboardContent'

const mockUsersEq = jest.fn()
const mockConversationsEq = jest.fn()
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

beforeEach(() => {
  jest.clearAllMocks()
  Object.keys(realtimeCallbacks).forEach(k => delete realtimeCallbacks[k])
  mockUsersEq.mockResolvedValue({ data: [] })
  mockConversationsEq.mockResolvedValue({ data: [] })
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
    mockUsersEq.mockResolvedValueOnce({
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
    mockUsersEq.mockResolvedValueOnce({ data: null })
    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })
    await waitFor(() => {
      expect(screen.getAllByText('0')).toHaveLength(3)
    })
  })

  it('handles null conversations response without crashing', async () => {
    mockConversationsEq.mockResolvedValueOnce({ data: null })
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
    mockUsersEq.mockResolvedValue({ data: [] })

    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })

    await waitFor(() => expect(screen.getAllByText('0')).toHaveLength(3))

    mockUsersEq.mockResolvedValue({
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

    expect(mockConversationsEq).toHaveBeenCalledTimes(1)

    await act(async () => {
      realtimeCallbacks['conversations-changes']?.()
    })

    expect(mockConversationsEq).toHaveBeenCalledTimes(2)
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
})
