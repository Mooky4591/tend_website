/**
 * @jest-environment node
 */

import { DELETE } from '@/app/api/warranty-docs/[planName]/route'
import { NextRequest } from 'next/server'

const mockGetUser = jest.fn()
const mockTenantSingle = jest.fn()
const mockDeleteEq = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'tenant_users') {
        return { select: () => ({ eq: () => ({ single: mockTenantSingle }) }) }
      }
      if (table === 'warranty_documents') {
        return { delete: () => ({ eq: () => ({ eq: mockDeleteEq }) }) }
      }
      throw new Error(`Unexpected table: ${table}`)
    },
  }),
}))

function makeRequest(planName = 'Premium Plan') {
  return new NextRequest(`http://localhost/api/warranty-docs/${encodeURIComponent(planName)}`, { method: 'DELETE' })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  mockTenantSingle.mockResolvedValue({ data: { tenant_id: 'tenant-1' } })
  mockDeleteEq.mockResolvedValue({ error: null })
})

describe('DELETE /api/warranty-docs/[planName]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await DELETE(makeRequest(), { params: { planName: 'Premium Plan' } })
    expect(res.status).toBe(401)
  })

  it('returns 403 when user has no tenant', async () => {
    mockTenantSingle.mockResolvedValueOnce({ data: null })
    const res = await DELETE(makeRequest(), { params: { planName: 'Premium Plan' } })
    expect(res.status).toBe(403)
  })

  it('returns ok:true on successful delete', async () => {
    const res = await DELETE(makeRequest(), { params: { planName: 'Premium Plan' } })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('returns 500 when DB delete fails', async () => {
    mockDeleteEq.mockResolvedValueOnce({ error: { message: 'constraint violation' } })
    const res = await DELETE(makeRequest(), { params: { planName: 'Premium Plan' } })
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('constraint violation')
  })

  it('passes the raw planName param to the DB query without double-decoding', async () => {
    await DELETE(makeRequest('My Plan'), { params: { planName: 'My Plan' } })
    expect(mockDeleteEq).toHaveBeenCalledWith('plan_name', 'My Plan')
  })
})
