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

  it('validSessionToken returns consistent value', async () => {
    const { validSessionToken } = await import('@/lib/admin-auth')
    const t1 = validSessionToken()
    const t2 = validSessionToken()
    expect(t1).toBe(t2)
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

  it('isAdminAuthenticated returns true when cookie matches validSessionToken', async () => {
    const secret = process.env.ADMIN_PASSWORD!
    const expectedToken = crypto.createHmac('sha256', secret).update(secret).digest('hex')

    jest.mock('next/headers', () => ({
      cookies: () => ({
        get: jest.fn().mockReturnValue({ value: expectedToken }),
        getAll: jest.fn().mockReturnValue([]),
      }),
    }))
    const { isAdminAuthenticated } = await import('@/lib/admin-auth')
    expect(isAdminAuthenticated()).toBe(true)
  })
})
