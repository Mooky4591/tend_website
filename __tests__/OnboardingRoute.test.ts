/** @jest-environment node */

const mockGetUser = jest.fn()
const mockMemberMaybeSingle = jest.fn()
const mockTriggerOnboarding = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'tenant_users') {
        return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: mockMemberMaybeSingle }) }) }) }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  }),
}))

jest.mock('@/lib/services/onboarding', () => ({
  triggerOnboarding: (...args: unknown[]) => mockTriggerOnboarding(...args),
}))

const ADMIN = { id: 'staff-1' }
const MEMBER = { role: 'admin', tenant_id: 'tenant-1' }
const PARAMS = { params: { id: 'u1' } }

function makeRequest(body: object) {
  return { json: async () => body } as never
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: ADMIN } })
  mockMemberMaybeSingle.mockResolvedValue({ data: MEMBER, error: null })
  mockTriggerOnboarding.mockResolvedValue(null)
})

describe('POST /api/users/[id]/onboarding', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { POST } = await import('@/app/api/users/[id]/onboarding/route')
    const res = await POST(makeRequest({ message: 'Hello' }), PARAMS)
    expect(res.status).toBe(401)
  })

  it('returns 403 when caller is not an admin', async () => {
    mockMemberMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    const { POST } = await import('@/app/api/users/[id]/onboarding/route')
    const res = await POST(makeRequest({ message: 'Hello' }), PARAMS)
    expect(res.status).toBe(403)
  })

  it('returns 400 when message is missing', async () => {
    const { POST } = await import('@/app/api/users/[id]/onboarding/route')
    const res = await POST(makeRequest({}), PARAMS)
    expect(res.status).toBe(400)
  })

  it('returns 400 when message is blank', async () => {
    const { POST } = await import('@/app/api/users/[id]/onboarding/route')
    const res = await POST(makeRequest({ message: '   ' }), PARAMS)
    expect(res.status).toBe(400)
  })

  it('returns 200 on success', async () => {
    const { POST } = await import('@/app/api/users/[id]/onboarding/route')
    const res = await POST(makeRequest({ message: 'Welcome!' }), PARAMS)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('returns 404 when service returns 404', async () => {
    mockTriggerOnboarding.mockResolvedValueOnce({ error: 'User not found', status: 404 })
    const { POST } = await import('@/app/api/users/[id]/onboarding/route')
    const res = await POST(makeRequest({ message: 'Hello' }), PARAMS)
    expect(res.status).toBe(404)
  })

  it('returns 502 when service returns 502', async () => {
    mockTriggerOnboarding.mockResolvedValueOnce({ error: 'SMS delivery failed', status: 502 })
    const { POST } = await import('@/app/api/users/[id]/onboarding/route')
    const res = await POST(makeRequest({ message: 'Hello' }), PARAMS)
    expect(res.status).toBe(502)
  })
})
