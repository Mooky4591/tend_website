import { render, screen, waitFor, act } from '@testing-library/react'
import DashboardContent from '@/app/dashboard/DashboardContent'

const mockUsersEq = jest.fn()
const mockSnapshotsOrder = jest.fn()
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
        if (table === 'monthly_billing_snapshots') {
          return { select: () => ({ eq: () => ({ order: mockSnapshotsOrder }) }) }
        }
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
  mockSnapshotsOrder.mockResolvedValue({ data: [] })
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
        { onboarding_complete: true, opted_out: false },
        { onboarding_complete: true, opted_out: false },
        { onboarding_complete: false, opted_out: true },
        { onboarding_complete: false, opted_out: false },
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

  it('handles null snapshots response without crashing', async () => {
    mockSnapshotsOrder.mockResolvedValueOnce({ data: null })
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
    expect(realtimeCallbacks['snapshots-changes']).toBeDefined()
  })

  it('re-fetches stats and updates the DOM when users realtime callback fires', async () => {
    mockUsersEq.mockResolvedValue({ data: [] })

    await act(async () => {
      render(<DashboardContent tenantId="tenant-1" />)
    })

    await waitFor(() => expect(screen.getAllByText('0')).toHaveLength(3))

    mockUsersEq.mockResolvedValue({
      data: [
        { onboarding_complete: true, opted_out: false },
        { onboarding_complete: false, opted_out: false },
        { onboarding_complete: false, opted_out: true },
      ],
    })

    await act(async () => {
      realtimeCallbacks['users-changes']?.()
    })

    await waitFor(() => {
      expect(screen.getByText('Total homeowners').closest('div')).toHaveTextContent('3')
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
})
