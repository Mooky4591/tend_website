/** @jest-environment node */

const mockGetUser = jest.fn()
// Two spies so we can assert both `.eq()` filters — column AND value — were applied
// in the right places. A single passthrough on the inner eq() (the previous shape)
// silently discarded the outer eq's args and could not catch a swapped or dropped
// `auth_user_id` / `role` filter in production code.
const mockMemberOuterEq = jest.fn()
const mockMemberInnerEq = jest.fn()
const mockUserSingle = jest.fn()
const mockUserIn = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'tenant_users') {
        return {
          select: () => ({
            eq: (...outerArgs: unknown[]) => {
              mockMemberOuterEq(...outerArgs)
              return {
                eq: (...innerArgs: unknown[]) => mockMemberInnerEq(...innerArgs),
              }
            },
          }),
        }
      }
      if (table === 'users') {
        return {
          update: () => ({
            eq: () => ({
              in: (...args: unknown[]) => {
                mockUserIn(...args)
                return { select: () => ({ single: mockUserSingle }) }
              },
            }),
          }),
        }
      }
      throw new Error(`Unexpected table ${table}`)
    },
  }),
}))

describe('PATCH /api/users/[id]/phone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'staff-1' } } })
    mockMemberInnerEq.mockResolvedValue({ data: [{ tenant_id: 'tenant-1' }], error: null })
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { PATCH } = await import('@/app/api/users/[id]/phone/route')
    const res = await PATCH({ json: async () => ({ phoneNumber: '+1555' }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(401)
  })

  it('returns 403 when authenticated user has no admin membership in any tenant', async () => {
    mockMemberInnerEq.mockResolvedValueOnce({ data: [], error: null })
    const { PATCH } = await import('@/app/api/users/[id]/phone/route')
    const res = await PATCH({ json: async () => ({ phoneNumber: '+1555000' }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(403)
  })

  it('applies the auth_user_id and role filters with the correct column names and values', async () => {
    mockUserSingle.mockResolvedValueOnce({ data: { id: 'u1', phone_number: '+1555000' }, error: null })
    const { PATCH } = await import('@/app/api/users/[id]/phone/route')
    await PATCH({ json: async () => ({ phoneNumber: '+1555000' }) } as any, { params: { id: 'u1' } })

    expect(mockMemberOuterEq).toHaveBeenCalledTimes(1)
    expect(mockMemberOuterEq).toHaveBeenCalledWith('auth_user_id', 'staff-1')

    expect(mockMemberInnerEq).toHaveBeenCalledTimes(1)
    expect(mockMemberInnerEq).toHaveBeenCalledWith('role', 'admin')
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

  it('scopes the update by .in(tenantIds) for an admin in multiple tenants', async () => {
    mockMemberInnerEq.mockResolvedValueOnce({
      data: [{ tenant_id: 'tenant-1' }, { tenant_id: 'tenant-2' }],
      error: null,
    })
    mockUserSingle.mockResolvedValueOnce({
      data: { id: 'u1', phone_number: '+1555000' },
      error: null,
    })
    const { PATCH } = await import('@/app/api/users/[id]/phone/route')
    const res = await PATCH({ json: async () => ({ phoneNumber: '+1555000' }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(200)
    expect(mockUserIn).toHaveBeenCalledTimes(1)
    const [column, ids] = mockUserIn.mock.calls[0]
    expect(column).toBe('tenant_id')
    expect(ids).toEqual(['tenant-1', 'tenant-2'])
  })

  it('returns 500 when membership query returns an error', async () => {
    mockMemberInnerEq.mockResolvedValueOnce({ data: null, error: { message: 'DB connection error' } })
    const { PATCH } = await import('@/app/api/users/[id]/phone/route')
    const res = await PATCH({ json: async () => ({ phoneNumber: '+1555000' }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(500)
  })

  it('returns 500 when update query fails with a non-PGRST116 error', async () => {
    mockUserSingle.mockResolvedValueOnce({ data: null, error: { code: 'CONSTRAINT_VIOLATION', message: 'duplicate key' } })
    const { PATCH } = await import('@/app/api/users/[id]/phone/route')
    const res = await PATCH({ json: async () => ({ phoneNumber: '+1555000' }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(500)
  })
})
