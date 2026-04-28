/**
 * @jest-environment node
 *
 * next/server requires the Request global (Web Fetch API).
 * The node environment provides it natively in Node 18+.
 */

import { middleware } from '@/middleware'
import { NextRequest } from 'next/server'

const mockGetUser = jest.fn()

// Capture the setAll callback so individual tests can trigger a simulated token refresh
let capturedSetAll: ((cookies: { name: string; value: string; options?: object }[]) => void) | null = null

jest.mock('@supabase/ssr', () => ({
  createServerClient: (_url: string, _key: string, { cookies }: { cookies: { setAll: typeof capturedSetAll } }) => {
    capturedSetAll = cookies.setAll
    return { auth: { getUser: mockGetUser } }
  },
}), { virtual: true })

function makeRequest(path: string) {
  return new NextRequest(new URL(`http://localhost${path}`))
}

beforeEach(() => {
  jest.clearAllMocks()
  capturedSetAll = null
})

describe('middleware', () => {
  describe('unauthenticated user', () => {
    it('redirects /dashboard to /login', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } })
      const res = await middleware(makeRequest('/dashboard'))
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/login')
    })

    it('redirects /dashboard/anything to /login', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } })
      const res = await middleware(makeRequest('/dashboard/settings'))
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/login')
    })

    it('allows /login through without redirecting', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } })
      const res = await middleware(makeRequest('/login'))
      expect(res.status).not.toBe(307)
    })
  })

  describe('authenticated user', () => {
    const fakeUser = { id: 'user-1', email: 'admin@example.com' }

    it('redirects /login to /dashboard', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: fakeUser } })
      const res = await middleware(makeRequest('/login'))
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/dashboard')
    })

    it('copies refreshed session cookies onto the /login redirect response', async () => {
      mockGetUser.mockImplementationOnce(async () => {
        // Simulate Supabase rotating the session token during getUser()
        capturedSetAll?.([{ name: 'sb-access-token', value: 'new-token', options: { httpOnly: true, path: '/' } }])
        return { data: { user: fakeUser } }
      })

      const res = await middleware(makeRequest('/login'))

      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toContain('/dashboard')
      // The refreshed cookie must be present on the redirect response
      const setCookie = res.headers.get('set-cookie')
      expect(setCookie).toContain('sb-access-token=new-token')
    })

    it('allows /dashboard through without redirecting', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: fakeUser } })
      const res = await middleware(makeRequest('/dashboard'))
      expect(res.status).not.toBe(307)
    })
  })
})
