/**
 * @jest-environment node
 */

let capturedConfig: { cookies: { getAll: () => unknown; setAll: (c: unknown) => void } } | null = null

const mockCookieStore = {
  getAll: jest.fn(() => [{ name: 'sb-access-token', value: 'abc' }]),
  set: jest.fn(),
}

jest.mock('next/headers', () => ({
  cookies: () => mockCookieStore,
}))

jest.mock('@supabase/ssr', () => ({
  createServerClient: (_url: string, _key: string, config: typeof capturedConfig extends infer T ? T : never) => {
    capturedConfig = config as never
    return { __kind: 'server-client' }
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
  capturedConfig = null
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123'
  mockCookieStore.set.mockReset()
  mockCookieStore.getAll.mockReturnValue([{ name: 'sb-access-token', value: 'abc' }])
})

describe('lib/supabase/server', () => {
  it('returns a server supabase client', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    expect(createClient()).toEqual({ __kind: 'server-client' })
  })

  it('exposes a cookies.getAll that proxies to next/headers cookies()', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    createClient()
    const result = capturedConfig?.cookies.getAll()
    expect(result).toEqual([{ name: 'sb-access-token', value: 'abc' }])
    expect(mockCookieStore.getAll).toHaveBeenCalled()
  })

  it('exposes a cookies.setAll that writes each cookie back to the store', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    createClient()
    capturedConfig?.cookies.setAll([
      { name: 'sb-access-token', value: 'new', options: { httpOnly: true } },
      { name: 'sb-refresh-token', value: 'rotated', options: { path: '/' } },
    ] as never)
    expect(mockCookieStore.set).toHaveBeenCalledTimes(2)
    expect(mockCookieStore.set).toHaveBeenNthCalledWith(1, 'sb-access-token', 'new', { httpOnly: true })
    expect(mockCookieStore.set).toHaveBeenNthCalledWith(2, 'sb-refresh-token', 'rotated', { path: '/' })
  })

  it('swallows errors from cookieStore.set so Server Components do not throw', async () => {
    mockCookieStore.set.mockImplementation(() => {
      throw new Error('Cookies can only be modified in a Server Action or Route Handler.')
    })
    const { createClient } = await import('@/lib/supabase/server')
    createClient()
    expect(() => capturedConfig?.cookies.setAll([
      { name: 'sb-access-token', value: 'x', options: {} },
    ] as never)).not.toThrow()
  })
})
