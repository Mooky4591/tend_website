const ORIGINAL_ENV = { ...process.env }

describe('createServiceClient', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('returns a client object when env vars are set', async () => {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const client = createServiceClient()
    expect(client).toBeDefined()
    expect(typeof client.from).toBe('function')
  })

  it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const { createServiceClient } = await import('@/lib/supabase/service')
    expect(() => createServiceClient()).toThrow('SUPABASE_SERVICE_ROLE_KEY')
  })

  it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const { createServiceClient } = await import('@/lib/supabase/service')
    expect(() => createServiceClient()).toThrow('NEXT_PUBLIC_SUPABASE_URL')
  })
})
