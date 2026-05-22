/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'

// Mock supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

// Mock supabase service client
jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(),
}))

// Mock the validator
jest.mock('@/lib/services/onboardingValidator', () => ({
  validateOnboardingCompleteness: jest.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { validateOnboardingCompleteness } from '@/lib/services/onboardingValidator'

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  const req = new NextRequest('http://localhost/api/users/user-1/onboarding-check', {
    method: 'POST',
  })
  Object.entries(headers).forEach(([k, v]) => req.headers.set(k, v))
  return req
}

function makeAuthClient(user: null | { id: string } = { id: 'staff-1' }, membership: null | { tenant_id: string } = { tenant_id: 'tenant-1' }, targetUser: null | { id: string } = { id: 'user-1' }) {
  return {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
    from: jest.fn((table: string) => {
      if (table === 'tenant_users') {
        return { select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: membership }) }) }) }
      }
      if (table === 'users') {
        return { select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: targetUser }) }) }) }) }
      }
    }),
  }
}

const ORIGINAL_ENV = { ...process.env }

describe('POST /api/users/[id]/onboarding-check', () => {
  const params = { id: 'user-1' }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'cron-secret'
    ;(validateOnboardingCompleteness as jest.Mock).mockResolvedValue({ gaps: [], flagged: false })
    ;(createServiceClient as jest.Mock).mockReturnValue({})
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('returns 401 when no auth and no cron secret', async () => {
    ;(createClient as jest.Mock).mockReturnValue(makeAuthClient(null))
    const { POST } = await import('@/app/api/users/[id]/onboarding-check/route')
    const res = await POST(makeRequest(), { params })
    expect(res.status).toBe(401)
  })

  it('returns 403 when authenticated user has no tenant membership', async () => {
    ;(createClient as jest.Mock).mockReturnValue(makeAuthClient({ id: 'staff-1' }, null))
    const { POST } = await import('@/app/api/users/[id]/onboarding-check/route')
    const res = await POST(makeRequest(), { params })
    expect(res.status).toBe(403)
  })

  it('returns 404 when target user does not belong to caller tenant', async () => {
    ;(createClient as jest.Mock).mockReturnValue(makeAuthClient({ id: 'staff-1' }, { tenant_id: 'tenant-1' }, null))
    const { POST } = await import('@/app/api/users/[id]/onboarding-check/route')
    const res = await POST(makeRequest(), { params })
    expect(res.status).toBe(404)
  })

  it('returns result for authenticated staff member', async () => {
    ;(createClient as jest.Mock).mockReturnValue(makeAuthClient())
    const { POST } = await import('@/app/api/users/[id]/onboarding-check/route')
    const res = await POST(makeRequest(), { params })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ gaps: [], flagged: false })
  })

  it('returns result when called with valid CRON_SECRET header (bypasses auth)', async () => {
    const { POST } = await import('@/app/api/users/[id]/onboarding-check/route')
    const res = await POST(makeRequest({ 'x-cron-secret': 'cron-secret' }), { params })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ gaps: [], flagged: false })
  })

  it('returns 500 when the validator throws', async () => {
    ;(validateOnboardingCompleteness as jest.Mock).mockRejectedValueOnce(new Error('DB error'))
    const { POST } = await import('@/app/api/users/[id]/onboarding-check/route')
    const res = await POST(makeRequest({ 'x-cron-secret': 'cron-secret' }), { params })
    expect(res.status).toBe(500)
  })
})
