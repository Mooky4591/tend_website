/**
 * @jest-environment node
 */

import { sendMessageToHomeowner } from '@/lib/services/messaging'
import { sendSms } from '@/lib/twilio'

jest.mock('@/lib/twilio', () => ({ sendSms: jest.fn() }))
jest.mock('@/lib/services/alerts', () => ({ sendAdminAlert: jest.fn().mockResolvedValue(undefined) }))

import { sendAdminAlert } from '@/lib/services/alerts'

const mockSendSms = sendSms as jest.Mock

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeSupabase({
  homeowner = { phone_number: '+15551234567', tenant_id: 'tenant-1' } as object | null,
  tenant = { twilio_phone_number: '+15559876543' } as object | null,
  insertError = null as { message: string } | null,
} = {}) {
  const mockInsert = jest.fn().mockResolvedValue({ error: insertError })
  return {
    from: (table: string) => {
      if (table === 'users') {
        return { select: () => ({ eq: () => ({ single: jest.fn().mockResolvedValue({ data: homeowner }) }) }) }
      }
      if (table === 'tenants') {
        return { select: () => ({ eq: () => ({ single: jest.fn().mockResolvedValue({ data: tenant }) }) }) }
      }
      if (table === 'conversations') {
        return { insert: mockInsert }
      }
    },
    _mockInsert: mockInsert,
  } as any // eslint-disable-line @typescript-eslint/no-explicit-any
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSendSms.mockResolvedValue(undefined)
})

describe('sendMessageToHomeowner', () => {
  it('returns null on full success', async () => {
    expect(await sendMessageToHomeowner(makeSupabase(), 'u1', 'Hello')).toBeNull()
  })

  it('returns status 404 when homeowner is not found', async () => {
    const result = await sendMessageToHomeowner(makeSupabase({ homeowner: null }), 'u1', 'Hello')
    expect(result).toMatchObject({ status: 404, error: 'User not found' })
  })

  it('returns status 500 when tenant has no Twilio number', async () => {
    const result = await sendMessageToHomeowner(
      makeSupabase({ tenant: { twilio_phone_number: null } }),
      'u1', 'Hello'
    )
    expect(result).toMatchObject({ status: 500 })
  })

  it('returns status 502 when Twilio throws', async () => {
    mockSendSms.mockRejectedValueOnce(new Error('unreachable'))
    const result = await sendMessageToHomeowner(makeSupabase(), 'u1', 'Hello')
    expect(result).toMatchObject({ status: 502, error: 'SMS delivery failed' })
  })

  it('calls sendAdminAlert with type "delivery_failure" when Twilio throws', async () => {
    mockSendSms.mockRejectedValueOnce(new Error('carrier blocked'))
    await sendMessageToHomeowner(makeSupabase(), 'u1', 'Hello')
    expect(sendAdminAlert).toHaveBeenCalledWith(
      'delivery_failure',
      'u1',
      expect.stringContaining('carrier blocked'),
    )
  })

  it('does not insert a conversation row when Twilio fails', async () => {
    mockSendSms.mockRejectedValueOnce(new Error('unreachable'))
    const supabase = makeSupabase()
    await sendMessageToHomeowner(supabase, 'u1', 'Hello')
    expect(supabase._mockInsert).not.toHaveBeenCalled()
  })

  it('returns status 500 with "Message sent but could not be saved" when insert fails', async () => {
    const result = await sendMessageToHomeowner(
      makeSupabase({ insertError: { message: 'constraint violation' } }),
      'u1', 'Hello'
    )
    expect(result?.status).toBe(500)
    expect(result?.error).toContain('Message sent but could not be saved')
  })
})
