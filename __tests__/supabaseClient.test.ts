/**
 * @jest-environment node
 */

const mockBrowserClient = jest.fn((..._args: unknown[]) => ({ __kind: 'browser-client' }))

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: (url: string, key: string) => mockBrowserClient(url, key),
}))

beforeEach(() => {
  jest.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123'
})

describe('lib/supabase/client', () => {
  it('returns a browser supabase client', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    expect(createClient()).toEqual({ __kind: 'browser-client' })
  })

  it('passes the public URL and anon key from env', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    createClient()
    expect(mockBrowserClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key-123',
    )
  })

  it('returns a fresh client per call (no singleton state)', async () => {
    const { createClient } = await import('@/lib/supabase/client')
    createClient()
    createClient()
    createClient()
    expect(mockBrowserClient).toHaveBeenCalledTimes(3)
  })
})
