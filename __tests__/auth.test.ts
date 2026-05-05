import { getTenantId } from '@/lib/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeSupabase(tenantId: string | null): any {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({
            data: tenantId !== null ? { tenant_id: tenantId } : null,
          }),
        }),
      }),
    }),
  }
}

describe('getTenantId', () => {
  it('returns the tenant ID string when the membership row exists', async () => {
    expect(await getTenantId(makeSupabase('tenant-abc'), 'user-1')).toBe('tenant-abc')
  })

  it('returns null when the user has no membership row', async () => {
    expect(await getTenantId(makeSupabase(null), 'user-2')).toBeNull()
  })
})
