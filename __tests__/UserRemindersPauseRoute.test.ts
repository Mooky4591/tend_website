/** @jest-environment node */

const mockGetUser = jest.fn()
const mockMemberMaybeSingle = jest.fn()
const mockUserSingle = jest.fn()
const mockUserUpdate = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'tenant_users') {
        return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: mockMemberMaybeSingle }) }) }) }
      }
      if (table === 'users') {
        return {
          update: (...args: unknown[]) => {
            mockUserUpdate(...args)
            return { eq: () => ({ eq: () => ({ select: () => ({ single: mockUserSingle }) }) }) }
          },
        }
      }
      throw new Error(`Unexpected table ${table}`)
    },
  }),
}))

describe('PATCH /api/users/[id]/reminders-pause', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'staff-1' } } })
    mockMemberMaybeSingle.mockResolvedValue({ data: { role: 'admin', tenant_id: 'tenant-1' }, error: null })
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { PATCH } = await import('@/app/api/users/[id]/reminders-pause/route')
    const res = await PATCH({ json: async () => ({ paused: true }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(401)
  })

  it('returns 403 when authenticated user is not an admin member', async () => {
    mockMemberMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    const { PATCH } = await import('@/app/api/users/[id]/reminders-pause/route')
    const res = await PATCH({ json: async () => ({ paused: true }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(403)
  })

  it('returns 400 when paused is missing', async () => {
    const { PATCH } = await import('@/app/api/users/[id]/reminders-pause/route')
    const res = await PATCH({ json: async () => ({}) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(400)
  })

  it('returns 400 when paused is not a boolean', async () => {
    const { PATCH } = await import('@/app/api/users/[id]/reminders-pause/route')
    const res = await PATCH({ json: async () => ({ paused: 'yes' }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(400)
  })

  it('returns 404 when row not found (PGRST116)', async () => {
    mockUserSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'not found' } })
    const { PATCH } = await import('@/app/api/users/[id]/reminders-pause/route')
    const res = await PATCH({ json: async () => ({ paused: true }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(404)
  })

  it('returns 200 with an ISO timestamp on pause', async () => {
    mockUserSingle.mockResolvedValueOnce({
      data: { id: 'u1', reminders_paused_at: '2026-05-18T12:00:00.000Z' },
      error: null,
    })
    const { PATCH } = await import('@/app/api/users/[id]/reminders-pause/route')
    const res = await PATCH({ json: async () => ({ paused: true }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(200)
    expect(mockUserUpdate).toHaveBeenCalledTimes(1)
    const updateArg = mockUserUpdate.mock.calls[0][0] as { reminders_paused_at: string | null }
    expect(typeof updateArg.reminders_paused_at).toBe('string')
    // Loose ISO 8601 sanity check.
    expect(updateArg.reminders_paused_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('returns 200 with reminders_paused_at set to null on unpause', async () => {
    mockUserSingle.mockResolvedValueOnce({
      data: { id: 'u1', reminders_paused_at: null },
      error: null,
    })
    const { PATCH } = await import('@/app/api/users/[id]/reminders-pause/route')
    const res = await PATCH({ json: async () => ({ paused: false }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(200)
    expect(mockUserUpdate).toHaveBeenCalledWith({ reminders_paused_at: null })
  })

  it('returns 500 when membership query returns an error', async () => {
    mockMemberMaybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'DB connection error' } })
    const { PATCH } = await import('@/app/api/users/[id]/reminders-pause/route')
    const res = await PATCH({ json: async () => ({ paused: true }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(500)
  })

  it('returns 500 when update query fails with a non-PGRST116 error', async () => {
    mockUserSingle.mockResolvedValueOnce({ data: null, error: { code: 'CONSTRAINT_VIOLATION', message: 'oops' } })
    const { PATCH } = await import('@/app/api/users/[id]/reminders-pause/route')
    const res = await PATCH({ json: async () => ({ paused: true }) } as any, { params: { id: 'u1' } })
    expect(res.status).toBe(500)
  })
})
