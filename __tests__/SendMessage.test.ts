/**
 * @jest-environment node
 */

import { POST } from '@/app/api/send-message/route'
import { NextRequest } from 'next/server'
import { sendSms } from '@/lib/twilio'

const mockGetUser = jest.fn()
const mockUserSingle = jest.fn()
const mockTenantSingle = jest.fn()
const mockConvInsert = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'users') {
        return { select: () => ({ eq: () => ({ single: mockUserSingle }) }) }
      }
      if (table === 'tenants') {
        return { select: () => ({ eq: () => ({ single: mockTenantSingle }) }) }
      }
      if (table === 'conversations') {
        return { insert: mockConvInsert }
      }
    },
  }),
}))

jest.mock('@/lib/twilio', () => ({ sendSms: jest.fn() }))

const mockSendSms = sendSms as jest.Mock

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/send-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'staff-1' } } })
  mockUserSingle.mockResolvedValue({ data: { phone_number: '+15551234567', tenant_id: 'tenant-1' } })
  mockTenantSingle.mockResolvedValue({ data: { twilio_phone_number: '+15559876543' } })
  mockConvInsert.mockResolvedValue({})
  mockSendSms.mockResolvedValue(undefined)
})

describe('POST /api/send-message', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await POST(makeRequest({ userId: 'u1', message: 'Hi' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when userId is missing', async () => {
    const res = await POST(makeRequest({ message: 'Hi' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when message is missing', async () => {
    const res = await POST(makeRequest({ userId: 'u1' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when message is blank whitespace', async () => {
    const res = await POST(makeRequest({ userId: 'u1', message: '   ' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when target user is not found (not in tenant)', async () => {
    mockUserSingle.mockResolvedValueOnce({ data: null })
    const res = await POST(makeRequest({ userId: 'u1', message: 'Hi' }))
    expect(res.status).toBe(404)
  })

  it('returns 500 when tenant has no Twilio number', async () => {
    mockTenantSingle.mockResolvedValueOnce({ data: { twilio_phone_number: null } })
    const res = await POST(makeRequest({ userId: 'u1', message: 'Hi' }))
    expect(res.status).toBe(500)
  })

  it('calls sendSms with from=twilio number, to=homeowner phone, body=trimmed message', async () => {
    await POST(makeRequest({ userId: 'u1', message: '  Hello there  ' }))
    expect(mockSendSms).toHaveBeenCalledWith('+15559876543', '+15551234567', 'Hello there')
  })

  it('inserts a conversations row with role staff', async () => {
    await POST(makeRequest({ userId: 'u1', message: 'Hi' }))
    expect(mockConvInsert).toHaveBeenCalledWith({
      user_id: 'u1',
      tenant_id: 'tenant-1',
      role: 'staff',
      content: 'Hi',
    })
  })

  it('returns 200 with ok:true on success', async () => {
    const res = await POST(makeRequest({ userId: 'u1', message: 'Hi' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })
})
