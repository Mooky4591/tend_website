/**
 * @jest-environment node
 */

import { GET } from '@/app/auth/callback/route'

const mockExchangeCodeForSession = jest.fn()

jest.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
    set: jest.fn(),
  }),
}))

jest.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  }),
}))

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/auth/callback')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new Request(url.toString())
}

beforeEach(() => {
  jest.clearAllMocks()
  mockExchangeCodeForSession.mockResolvedValue({ error: null })
})

describe('GET /auth/callback', () => {
  it('redirects to /dashboard when code exchange succeeds', async () => {
    const res = await GET(makeRequest({ code: 'valid-code' }))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/dashboard')
  })

  it('redirects to a custom next param when it is a valid relative path', async () => {
    const res = await GET(makeRequest({ code: 'valid-code', next: '/dashboard/users' }))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/dashboard/users')
  })

  it('ignores next param starting with // to prevent open redirect', async () => {
    const res = await GET(makeRequest({ code: 'valid-code', next: '//evil.com/steal' }))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/dashboard')
  })

  it('redirects to /login?error=auth_callback_failed when no code is present', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/login?error=auth_callback_failed')
  })

  it('redirects to /login?error=auth_callback_failed when code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: { message: 'invalid code' } })
    const res = await GET(makeRequest({ code: 'bad-code' }))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/login?error=auth_callback_failed')
  })
})
