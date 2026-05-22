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

function makeRequest(id: string): NextRequest {
  return new NextRequest(`http://localhost/api/admin/alerts/${id}/resolve`, {
    method: 'POST',
  })
}

describe('POST /api/admin/alerts/[id]/resolve', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockReturnValue(true)
    mockServiceClient.from.mockReturnValue({ update: mockUpdate })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ error: null })
  })

  it('redirects to /admin/login with status 303 when not authenticated', async () => {
    mockIsAdminAuthenticated.mockReturnValue(false)
    const { POST } = await import('@/app/api/admin/alerts/[id]/resolve/route')
    const res = await POST(makeRequest('alert-1'), { params: { id: 'alert-1' } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/login')
  })

  it('sets resolved = true on the matching system_alerts row', async () => {
    const { POST } = await import('@/app/api/admin/alerts/[id]/resolve/route')
    await POST(makeRequest('alert-1'), { params: { id: 'alert-1' } })
    expect(mockServiceClient.from).toHaveBeenCalledWith('system_alerts')
    expect(mockUpdate).toHaveBeenCalledWith({ resolved: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'alert-1')
  })

  it('redirects to /admin/alerts with status 303 on success', async () => {
    const { POST } = await import('@/app/api/admin/alerts/[id]/resolve/route')
    const res = await POST(makeRequest('alert-1'), { params: { id: 'alert-1' } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/alerts')
  })
})
