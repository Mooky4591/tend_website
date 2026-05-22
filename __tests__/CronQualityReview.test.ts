/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'

jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn().mockReturnValue({}),
}))

jest.mock('@/lib/services/qualityMonitor', () => ({
  runNightlyQualityReview: jest.fn().mockResolvedValue({ reviewed: 5, flagged: 1 }),
}))

import { runNightlyQualityReview } from '@/lib/services/qualityMonitor'

const ORIGINAL_ENV = { ...process.env }

function makePostRequest(cronSecret?: string): NextRequest {
  const req = new NextRequest('http://localhost/api/cron/quality-review', { method: 'POST' })
  if (cronSecret) req.headers.set('x-cron-secret', cronSecret)
  return req
}

describe('POST /api/cron/quality-review', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'valid-cron-secret'
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('returns 401 when CRON_SECRET env var is not set (fail closed)', async () => {
    delete process.env.CRON_SECRET
    const { POST } = await import('@/app/api/cron/quality-review/route')
    // Even sending the literal string 'undefined' must not grant access
    const res = await POST(makePostRequest('undefined'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when x-cron-secret header is missing', async () => {
    const { POST } = await import('@/app/api/cron/quality-review/route')
    const res = await POST(makePostRequest())
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when x-cron-secret header is wrong', async () => {
    const { POST } = await import('@/app/api/cron/quality-review/route')
    const res = await POST(makePostRequest('wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('returns { ok: true, reviewed, flagged } when authorized and review succeeds', async () => {
    const { POST } = await import('@/app/api/cron/quality-review/route')
    const res = await POST(makePostRequest('valid-cron-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, reviewed: 5, flagged: 1 })
  })

  it('returns 500 when runNightlyQualityReview throws', async () => {
    ;(runNightlyQualityReview as jest.Mock).mockRejectedValueOnce(new Error('Review error'))
    const { POST } = await import('@/app/api/cron/quality-review/route')
    const res = await POST(makePostRequest('valid-cron-secret'))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('Review error')
  })
})
