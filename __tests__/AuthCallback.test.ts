/**
 * @jest-environment node
 */

import { GET } from '@/app/auth/callback/route'

const mockExchangeCodeForSession = jest.fn()
const mockCookieSet = jest.fn()
const mockCreateServerClient = jest.fn()

jest.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
    set: mockCookieSet,
  }),
}))

jest.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}))

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/auth/callback')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new Request(url.toString())
}

beforeEach(() => {
  jest.clearAllMocks()
  mockExchangeCodeForSession.mockResolvedValue({ error: null })
  mockCreateServerClient.mockImplementation(() => ({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  }))
})

describe('GET /auth/callback', () => {
  it('redirects to /dashboard when code exchange succeeds', async () => {
    const res = await GET(makeRequest({ code: 'valid-code' }))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/dashboard')
  })

  it('redirects to a custom next param when it is a valid relative path', async () => {
    const res = await GET(makeRequest({ code: 'valid-code', next: '/dashboard/homeowners' }))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/dashboard/homeowners')
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

  it('getAll returns all cookies from the cookie store', async () => {
    let capturedGetAll: (() => unknown[]) | null = null
    mockCreateServerClient.mockImplementationOnce(
      (_url: unknown, _key: unknown, config: { cookies: { getAll: () => unknown[] } }) => {
        capturedGetAll = config.cookies.getAll
        return { auth: { exchangeCodeForSession: mockExchangeCodeForSession } }
      }
    )
    await GET(makeRequest({ code: 'valid-code' }))
    expect(capturedGetAll).not.toBeNull()
    expect(capturedGetAll!()).toEqual([])
  })

  it('setAll writes each cookie to the cookie store', async () => {
    type CookieEntry = { name: string; value: string; options: Record<string, unknown> }
    mockCreateServerClient.mockImplementationOnce(
      (_url: unknown, _key: unknown, config: { cookies: { setAll: (c: CookieEntry[]) => void } }) => {
        config.cookies.setAll([{ name: 'sb-auth-token', value: 'tok123', options: { path: '/' } }])
        return { auth: { exchangeCodeForSession: mockExchangeCodeForSession } }
      }
    )
    await GET(makeRequest({ code: 'valid-code' }))
    expect(mockCookieSet).toHaveBeenCalledWith('sb-auth-token', 'tok123', { path: '/' })
  })
})
