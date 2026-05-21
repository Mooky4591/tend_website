/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'

const mockIsAdminAuthenticated = jest.fn()
jest.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: () => mockIsAdminAuthenticated(),
}))

const mockEq = jest.fn().mockResolvedValue({ error: null })
const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'conv-1' } })
const mockLimit = jest.fn().mockReturnValue({ single: mockSingle })
const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit })
const mockSelectEq = jest.fn().mockReturnValue({ order: mockOrder })
const mockSelect = jest.fn().mockReturnValue({ eq: mockSelectEq })

const mockServiceClient = {
  from: jest.fn((table: string) => {
    if (table === 'conversations') {
      return { select: mockSelect, update: mockUpdate }
    }
    return {}
  }),
}
jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(() => mockServiceClient),
}))

function makeFormRequest(userId: string, body: Record<string, string>): NextRequest {
  const formData = new URLSearchParams(body).toString()
  return new NextRequest(`http://localhost/api/admin/conversations/${userId}/flag`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: formData,
  })
}

describe('POST /api/admin/conversations/[userId]/flag', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockReturnValue(true)
    mockSingle.mockResolvedValue({ data: { id: 'conv-1' } })
    mockLimit.mockReturnValue({ single: mockSingle })
    mockOrder.mockReturnValue({ limit: mockLimit })
    mockSelectEq.mockReturnValue({ order: mockOrder })
    mockSelect.mockReturnValue({ eq: mockSelectEq })
    mockEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockServiceClient.from.mockImplementation((table: string) => {
      if (table === 'conversations') return { select: mockSelect, update: mockUpdate }
      return {}
    })
  })

  it('redirects to /admin/login with status 303 when not authenticated', async () => {
    mockIsAdminAuthenticated.mockReturnValue(false)
    const { POST } = await import('@/app/api/admin/conversations/[userId]/flag/route')
    const res = await POST(makeFormRequest('u1', { reason: 'bad' }), { params: { userId: 'u1' } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/login')
  })

  it('sets manually_flagged = true and the reason when flagging', async () => {
    const { POST } = await import('@/app/api/admin/conversations/[userId]/flag/route')
    await POST(makeFormRequest('u1', { reason: 'missed follow-up' }), { params: { userId: 'u1' } })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ manually_flagged: true, manually_flagged_reason: 'missed follow-up' }),
    )
  })

  it('sets manually_flagged = false and reason = null when unflaging', async () => {
    const { POST } = await import('@/app/api/admin/conversations/[userId]/flag/route')
    await POST(makeFormRequest('u1', { unflag: 'true' }), { params: { userId: 'u1' } })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ manually_flagged: false, manually_flagged_reason: null }),
    )
  })

  it('redirects to the conversation thread page with status 303 on success', async () => {
    const { POST } = await import('@/app/api/admin/conversations/[userId]/flag/route')
    const res = await POST(makeFormRequest('u1', { reason: 'test' }), { params: { userId: 'u1' } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/conversation/u1')
  })
})
