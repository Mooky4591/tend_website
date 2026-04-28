/**
 * @jest-environment node
 */

import { GET } from '@/app/auth/confirm/route'
import { NextRequest } from 'next/server'

const mockVerifyOtp = jest.fn()
const mockExchangeCodeForSession = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      verifyOtp: mockVerifyOtp,
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
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
  mockExchangeCodeForSession.mockResolvedValue({ error: null })
})

describe('GET /auth/confirm', () => {
  describe('code exchange flow ({{ .ConfirmationURL }})', () => {
    it('exchanges the code and redirects to next on success', async () => {
      const res = await GET(makeRequest({ code: 'abc123', next: '/reset-password' }))
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('abc123')
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/reset-password')
    })

    it('defaults next to /reset-password when not provided', async () => {
      const res = await GET(makeRequest({ code: 'abc123' }))
      expect(res.headers.get('location')).toContain('/reset-password')
    })

    it('redirects to /login?error=code_exchange_failed when exchange fails', async () => {
      mockExchangeCodeForSession.mockResolvedValueOnce({ error: new Error('bad code') })
      const res = await GET(makeRequest({ code: 'bad' }))
      expect(res.headers.get('location')).toContain('/login?error=code_exchange_failed')
    })
  })

  describe('token_hash flow ({{ .TokenHash }} template)', () => {
    it('verifies the OTP and redirects to /reset-password on success', async () => {
      const res = await GET(makeRequest({ token_hash: 'abc123', type: 'recovery' }))
      expect(mockVerifyOtp).toHaveBeenCalledWith({ type: 'recovery', token_hash: 'abc123' })
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/reset-password')
    })

    it('redirects to /login?error=otp_verification_failed when verifyOtp fails', async () => {
      mockVerifyOtp.mockResolvedValueOnce({ error: new Error('Invalid token') })
      const res = await GET(makeRequest({ token_hash: 'bad', type: 'recovery' }))
      expect(res.headers.get('location')).toContain('/login?error=otp_verification_failed')
    })
  })

  it('redirects to /login?error=missing_auth_params when neither code nor token_hash is present', async () => {
    const res = await GET(makeRequest({}))
    expect(mockVerifyOtp).not.toHaveBeenCalled()
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toContain('/login?error=missing_auth_params')
  })
})
