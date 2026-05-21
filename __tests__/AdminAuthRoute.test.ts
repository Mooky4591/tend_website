/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'

jest.mock('@/lib/admin-auth', () => ({
  hashPassword: jest.fn((p: string) => (p === 'correct-password' ? 'correct-hash' : 'wrong-hash')),
  validSessionToken: jest.fn().mockReturnValue('correct-hash'),
  adminCookieOptions: { httpOnly: true, maxAge: 3600 },
  ADMIN_COOKIE_NAME: 'admin_session',
}))

const ORIGINAL_ENV = { ...process.env }

function makeFormRequest(data: Record<string, string>): NextRequest {
  const formData = new URLSearchParams(data).toString()
  return new NextRequest('http://localhost/api/admin/auth', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: formData,
  })
}

describe('POST /api/admin/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_PASSWORD = 'correct-password'
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('sets the session cookie and redirects to /admin on correct password', async () => {
    const { POST } = await import('@/app/api/admin/auth/route')
    const res = await POST(makeFormRequest({ password: 'correct-password' }))
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin')
    expect(res.headers.get('set-cookie')).toContain('admin_session')
  })

  it('redirects to /admin/login with error on wrong password', async () => {
    const { POST } = await import('@/app/api/admin/auth/route')
    const res = await POST(makeFormRequest({ password: 'wrong' }))
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/login')
    expect(res.headers.get('location')).toContain('error=')
  })

  it('redirects to /admin/login with error when password is missing', async () => {
    const { POST } = await import('@/app/api/admin/auth/route')
    const res = await POST(makeFormRequest({}))
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/login')
    expect(res.headers.get('location')).toContain('error=')
  })

  it('redirects to /admin/login with error when ADMIN_PASSWORD env var is not set', async () => {
    delete process.env.ADMIN_PASSWORD
    const { POST } = await import('@/app/api/admin/auth/route')
    const res = await POST(makeFormRequest({ password: 'any' }))
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/login')
  })

  it('clears the cookie and redirects to /admin/login on logout', async () => {
    const { POST } = await import('@/app/api/admin/auth/route')
    const res = await POST(makeFormRequest({ action: 'logout' }))
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/admin/login')
    const cookie = res.headers.get('set-cookie') ?? ''
    expect(cookie).toContain('admin_session=')
    expect(cookie).toMatch(/max-age=0/i)
  })
})
