import crypto from 'crypto'

const ORIGINAL_ENV = { ...process.env }

describe('admin-auth helpers', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.ADMIN_PASSWORD = 'super-secret-password'
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('hashPassword returns a hex string', async () => {
    const { hashPassword } = await import('@/lib/admin-auth')
    const hash = hashPassword('test')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('hashPassword returns different values for different passwords', async () => {
    const { hashPassword } = await import('@/lib/admin-auth')
    const h1 = hashPassword('pass1')
    const h2 = hashPassword('pass2')
    expect(h1).not.toBe(h2)
  })

  it('createSessionToken returns a string in hmac:issuedAt format', async () => {
    const { createSessionToken } = await import('@/lib/admin-auth')
    const token = createSessionToken()
    expect(token).toMatch(/^[0-9a-f]{64}:\d+$/)
  })

  it('createSessionToken returns a unique token on each call', async () => {
    const { createSessionToken } = await import('@/lib/admin-auth')
    const t1 = createSessionToken()
    // Advance time slightly so timestamps differ
    await new Promise(r => setTimeout(r, 2))
    const t2 = createSessionToken()
    expect(t1).not.toBe(t2)
  })

  it('isAdminAuthenticated returns false when cookie is absent', async () => {
    jest.mock('next/headers', () => ({
      cookies: () => ({
        get: jest.fn().mockReturnValue(undefined),
        getAll: jest.fn().mockReturnValue([]),
      }),
    }))
    const { isAdminAuthenticated } = await import('@/lib/admin-auth')
    expect(isAdminAuthenticated()).toBe(false)
  })

  it('isAdminAuthenticated returns false when cookie value is wrong', async () => {
    jest.mock('next/headers', () => ({
      cookies: () => ({
        get: jest.fn().mockReturnValue({ value: 'wrong-value' }),
        getAll: jest.fn().mockReturnValue([]),
      }),
    }))
    const { isAdminAuthenticated } = await import('@/lib/admin-auth')
    expect(isAdminAuthenticated()).toBe(false)
  })

  it('isAdminAuthenticated returns false for an old-format token (no issuedAt suffix)', async () => {
    const secret = process.env.ADMIN_PASSWORD!
    // Old format: HMAC(password, password) — no `:timestamp` suffix
    const oldToken = crypto.createHmac('sha256', secret).update(secret).digest('hex')
    jest.mock('next/headers', () => ({
      cookies: () => ({
        get: jest.fn().mockReturnValue({ value: oldToken }),
        getAll: jest.fn().mockReturnValue([]),
      }),
    }))
    const { isAdminAuthenticated } = await import('@/lib/admin-auth')
    expect(isAdminAuthenticated()).toBe(false)
  })

  it('isAdminAuthenticated returns false for an expired token', async () => {
    const secret = process.env.ADMIN_PASSWORD!
    // issuedAt more than 8 hours ago
    const issuedAt = (Date.now() - 8 * 60 * 60 * 1000 - 1000).toString()
    const hmac = crypto.createHmac('sha256', secret).update(issuedAt).digest('hex')
    const expiredToken = `${hmac}:${issuedAt}`

    jest.mock('next/headers', () => ({
      cookies: () => ({
        get: jest.fn().mockReturnValue({ value: expiredToken }),
        getAll: jest.fn().mockReturnValue([]),
      }),
    }))
    const { isAdminAuthenticated } = await import('@/lib/admin-auth')
    expect(isAdminAuthenticated()).toBe(false)
  })

  it('isAdminAuthenticated returns true for a valid per-session token', async () => {
    const secret = process.env.ADMIN_PASSWORD!
    const issuedAt = Date.now().toString()
    const hmac = crypto.createHmac('sha256', secret).update(issuedAt).digest('hex')
    const validToken = `${hmac}:${issuedAt}`

    jest.mock('next/headers', () => ({
      cookies: () => ({
        get: jest.fn().mockReturnValue({ value: validToken }),
        getAll: jest.fn().mockReturnValue([]),
      }),
    }))
    const { isAdminAuthenticated } = await import('@/lib/admin-auth')
    expect(isAdminAuthenticated()).toBe(true)
  })

  it('isAdminAuthenticated returns false when ADMIN_PASSWORD is not set (fail closed)', async () => {
    delete process.env.ADMIN_PASSWORD
    jest.mock('next/headers', () => ({
      cookies: () => ({
        // A crafted token that looks valid structurally should still be rejected
        get: jest.fn().mockReturnValue({
          value: `${crypto.createHmac('sha256', '').update(Date.now().toString()).digest('hex')}:${Date.now()}`,
        }),
        getAll: jest.fn().mockReturnValue([]),
      }),
    }))
    const { isAdminAuthenticated } = await import('@/lib/admin-auth')
    expect(isAdminAuthenticated()).toBe(false)
  })
})
