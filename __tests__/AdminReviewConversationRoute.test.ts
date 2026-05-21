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
    if (table === 'conversations') return { select: mockSelect, update: mockUpdate }
    return {}
  }),
}
jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(() => mockServiceClient),
}))

function makeRequest(userId: string): NextRequest {
  return new NextRequest(`http://localhost/api/admin/conversations/${userId}/review`, {
    method: 'POST',
  })
}

describe('POST /api/admin/conversations/[userId]/review', () => {
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
    const { POST } = await import('@/app/api/admin/conversations/[userId]/review/route')
    const res = await POST(makeRequest('u1'), { params: { userId: 'u1' } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/login')
  })

  it('sets manually_reviewed = true on the most recent conversation', async () => {
    const { POST } = await import('@/app/api/admin/conversations/[userId]/review/route')
    await POST(makeRequest('u1'), { params: { userId: 'u1' } })
    expect(mockUpdate).toHaveBeenCalledWith({ manually_reviewed: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'conv-1')
  })

  it('redirects to the conversation thread page with status 303 on success', async () => {
    const { POST } = await import('@/app/api/admin/conversations/[userId]/review/route')
    const res = await POST(makeRequest('u1'), { params: { userId: 'u1' } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/conversation/u1')
  })
})
