/** @jest-environment node */

const mockGetUser = jest.fn()
const mockMemberMaybeSingle = jest.fn()
const mockUserSingle = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'tenant_users') {
        return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: mockMemberMaybeSingle }) }) }) }
      }
      if (table === 'users') {
        return { update: () => ({ eq: () => ({ select: () => ({ single: mockUserSingle }) }) }) }
      }
      throw new Error(`Unexpected table ${table}`)
    },
  }),
}))

describe('PATCH /api/users/[id]/phone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'staff-1' } } })
    mockMemberMaybeSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { PATCH } = await import('@/app/api/users/[id]/phone/route')
    const res = await PATCH({ json: async () => ({ phoneNumber: '+1555' }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(401)
  })

  it('returns 403 when authenticated user is not an admin member', async () => {
    mockMemberMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    const { PATCH } = await import('@/app/api/users/[id]/phone/route')
    const res = await PATCH({ json: async () => ({ phoneNumber: '+1555000' }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(403)
  })

  it('returns 400 for empty input', async () => {
    const { PATCH } = await import('@/app/api/users/[id]/phone/route')
    const res = await PATCH({ json: async () => ({ phoneNumber: '   ' }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(400)
  })

  it('returns 404 when row not found (PGRST116)', async () => {
    mockUserSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'not found' } })
    const { PATCH } = await import('@/app/api/users/[id]/phone/route')
    const res = await PATCH({ json: async () => ({ phoneNumber: '+1555000' }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(404)
  })

  it('returns 200 with updated phone on success', async () => {
    mockUserSingle.mockResolvedValueOnce({ data: { id: 'u1', phone_number: '+1555000' }, error: null })
    const { PATCH } = await import('@/app/api/users/[id]/phone/route')
    const res = await PATCH({ json: async () => ({ phoneNumber: '+1555000' }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(200)
  })
})
