import { triggerOnboarding } from '@/lib/services/onboarding'

const mockSendSms = jest.fn()
jest.mock('@/lib/twilio', () => ({ sendSms: (...args: unknown[]) => mockSendSms(...args) }))

const mockUsersSelect = jest.fn()
const mockTenantsSelect = jest.fn()
const mockConversationsInsert = jest.fn()
const mockUsersUpdate = jest.fn()

function makeSupabase() {
  return {
    from: (table: string) => {
      if (table === 'users') {
        return {
          select: () => ({ eq: () => ({ single: mockUsersSelect }) }),
          update: (data: unknown) => ({ eq: (col: string, val: string) => mockUsersUpdate(data, col, val) }),
        }
      }
      if (table === 'tenants') {
        return { select: () => ({ eq: () => ({ single: mockTenantsSelect }) }) }
      }
      if (table === 'conversations') {
        return { insert: (data: unknown) => mockConversationsInsert(data) }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  }
}

const HOMEOWNER = { phone_number: '+15551234567', tenant_id: 'tenant-1' }
const TENANT = { twilio_phone_number: '+18005550000' }

beforeEach(() => {
  jest.clearAllMocks()
  mockUsersSelect.mockResolvedValue({ data: HOMEOWNER })
  mockTenantsSelect.mockResolvedValue({ data: TENANT })
  mockSendSms.mockResolvedValue(undefined)
  mockConversationsInsert.mockResolvedValue({ error: null })
  mockUsersUpdate.mockResolvedValue({ error: null })
})

describe('triggerOnboarding', () => {
  it('returns null on success', async () => {
    const result = await triggerOnboarding(makeSupabase() as never, 'user-1', 'Welcome!')
    expect(result).toBeNull()
  })

  it('inserts a staff conversation row on success', async () => {
    await triggerOnboarding(makeSupabase() as never, 'user-1', 'Welcome!')
    expect(mockConversationsInsert).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'staff', content: 'Welcome!', user_id: 'user-1', tenant_id: 'tenant-1' })
    )
  })

  it('sets onboarding_status to queued and clears failure_reason on success', async () => {
    await triggerOnboarding(makeSupabase() as never, 'user-1', 'Welcome!')
    expect(mockUsersUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ onboarding_status: 'queued', failure_reason: null }),
      'id', 'user-1'
    )
  })

  it('returns status 502 when SMS fails', async () => {
    mockSendSms.mockRejectedValue({ code: 21614 })
    const result = await triggerOnboarding(makeSupabase() as never, 'user-1', 'Welcome!')
    expect(result?.status).toBe(502)
  })

  it('sets onboarding_status to failed with correct failure_reason for landline error', async () => {
    mockSendSms.mockRejectedValue({ code: 21614 })
    await triggerOnboarding(makeSupabase() as never, 'user-1', 'Welcome!')
    expect(mockUsersUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ onboarding_status: 'failed', failure_reason: 'landline' }),
      'id', 'user-1'
    )
  })

  it('sets failure_reason to carrier_blocked for code 30007', async () => {
    mockSendSms.mockRejectedValue({ code: 30007 })
    await triggerOnboarding(makeSupabase() as never, 'user-1', 'Welcome!')
    expect(mockUsersUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ failure_reason: 'carrier_blocked' }),
      'id', 'user-1'
    )
  })

  it('sets failure_reason to network_error for unknown Twilio code', async () => {
    mockSendSms.mockRejectedValue({ code: 99999 })
    await triggerOnboarding(makeSupabase() as never, 'user-1', 'Welcome!')
    expect(mockUsersUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ failure_reason: 'network_error' }),
      'id', 'user-1'
    )
  })

  it('does not insert a conversation row when SMS fails', async () => {
    mockSendSms.mockRejectedValue({ code: 21211 })
    await triggerOnboarding(makeSupabase() as never, 'user-1', 'Welcome!')
    expect(mockConversationsInsert).not.toHaveBeenCalled()
  })

  it('returns status 404 when homeowner is not found', async () => {
    mockUsersSelect.mockResolvedValue({ data: null })
    const result = await triggerOnboarding(makeSupabase() as never, 'user-1', 'Welcome!')
    expect(result?.status).toBe(404)
  })

  it('returns status 500 when tenant has no Twilio number', async () => {
    mockTenantsSelect.mockResolvedValue({ data: { twilio_phone_number: null } })
    const result = await triggerOnboarding(makeSupabase() as never, 'user-1', 'Welcome!')
    expect(result?.status).toBe(500)
  })
})
