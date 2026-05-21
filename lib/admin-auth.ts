import { cookies } from 'next/headers'
import crypto from 'crypto'

export const ADMIN_COOKIE_NAME = 'admin_session'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

/**
 * Hashes the admin password with a fixed salt for cookie comparison.
 * This is a simple HMAC — not a password storage scheme.
 */
export function hashPassword(password: string): string {
  const secret = process.env.ADMIN_PASSWORD ?? ''
  return crypto.createHmac('sha256', secret).update(password).digest('hex')
}

/**
 * Returns the expected cookie value for a valid admin session.
 */
export function validSessionToken(): string {
  return hashPassword(process.env.ADMIN_PASSWORD ?? '')
}

/**
 * Checks whether the current request has a valid admin session cookie.
 * Call this at the top of every admin Server Component.
 */
export function isAdminAuthenticated(): boolean {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)
  if (!sessionCookie) return false
  return sessionCookie.value === validSessionToken()
}

/**
 * Cookie options to set on the admin session cookie.
 */
export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: COOKIE_MAX_AGE_SECONDS,
  path: '/',
}
