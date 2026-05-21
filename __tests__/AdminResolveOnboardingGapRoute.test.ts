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
const mockServiceClient = {
  from: jest.fn().mockReturnValue({ update: mockUpdate }),
}
jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(() => mockServiceClient),
}))

function makeRequest(userId: string): NextRequest {
  return new NextRequest(`http://localhost/api/admin/onboarding-gaps/${userId}/resolve`, {
    method: 'POST',
  })
}

describe('POST /api/admin/onboarding-gaps/[userId]/resolve', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockReturnValue(true)
    mockServiceClient.from.mockReturnValue({ update: mockUpdate })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ error: null })
  })

  it('redirects to /admin/login with status 303 when not authenticated', async () => {
    mockIsAdminAuthenticated.mockReturnValue(false)
    const { POST } = await import('@/app/api/admin/onboarding-gaps/[userId]/resolve/route')
    const res = await POST(makeRequest('u1'), { params: { userId: 'u1' } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/login')
  })

  it('sets onboarding_gap_flagged = false for the given user', async () => {
    const { POST } = await import('@/app/api/admin/onboarding-gaps/[userId]/resolve/route')
    await POST(makeRequest('u1'), { params: { userId: 'u1' } })
    expect(mockServiceClient.from).toHaveBeenCalledWith('users')
    expect(mockUpdate).toHaveBeenCalledWith({ onboarding_gap_flagged: false })
    expect(mockEq).toHaveBeenCalledWith('id', 'u1')
  })

  it('redirects to /admin/onboarding-gaps with status 303 on success', async () => {
    const { POST } = await import('@/app/api/admin/onboarding-gaps/[userId]/resolve/route')
    const res = await POST(makeRequest('u1'), { params: { userId: 'u1' } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/onboarding-gaps')
  })
})
