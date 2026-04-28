/**
 * @jest-environment node
 */

import { GET } from '@/app/auth/confirm/route'
import { NextRequest } from 'next/server'

const mockVerifyOtp = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { verifyOtp: mockVerifyOtp },
  }),
}))

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/auth/confirm')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url)
}

beforeEach(() => {
  jest.clearAllMocks()
  mockVerifyOtp.mockResolvedValue({ error: null })
})

describe('GET /auth/confirm', () => {
  it('redirects to /reset-password on successful recovery token verification', async () => {
    const res = await GET(makeRequest({ token_hash: 'abc123', type: 'recovery' }))
    expect(mockVerifyOtp).toHaveBeenCalledWith({ type: 'recovery', token_hash: 'abc123' })
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/reset-password')
  })

  it('redirects to /login?error=auth_callback_failed when verifyOtp returns an error', async () => {
    mockVerifyOtp.mockResolvedValueOnce({ error: new Error('Invalid token') })
    const res = await GET(makeRequest({ token_hash: 'bad', type: 'recovery' }))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login?error=auth_callback_failed')
  })

  it('redirects to /login?error=auth_callback_failed when token_hash is missing', async () => {
    const res = await GET(makeRequest({ type: 'recovery' }))
    expect(mockVerifyOtp).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toContain('/login?error=auth_callback_failed')
  })

  it('redirects to /login?error=auth_callback_failed when type is missing', async () => {
    const res = await GET(makeRequest({ token_hash: 'abc123' }))
    expect(mockVerifyOtp).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toContain('/login?error=auth_callback_failed')
  })
})
