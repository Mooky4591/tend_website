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
 * Creates a fresh per-session token in the format `hmac:issuedAt`.
 * The HMAC is computed over the issuedAt millisecond timestamp string using
 * ADMIN_PASSWORD as the HMAC key. Each call produces a unique, time-bound token,
 * so a captured token cannot be reused once COOKIE_MAX_AGE_SECONDS have elapsed
 * (the server validates both the HMAC and the age on every request).
 */
export function createSessionToken(): string {
  const issuedAt = Date.now().toString()
  const hmac = hashPassword(issuedAt)
  return `${hmac}:${issuedAt}`
}

/**
 * Checks whether the current request has a valid admin session cookie.
 * Validates both the HMAC signature and the token age. Fails closed in two ways:
 * - Returns false immediately when ADMIN_PASSWORD is not set (misconfigured environment).
 * - Returns false when the token is older than COOKIE_MAX_AGE_SECONDS (server-side expiry).
 */
export function isAdminAuthenticated(): boolean {
  if (!process.env.ADMIN_PASSWORD) return false
  const cookieStore = cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  if (!token) return false
  const colonIdx = token.lastIndexOf(':')
  if (colonIdx < 0) return false
  const receivedHmac = token.slice(0, colonIdx)
  const issuedAtStr = token.slice(colonIdx + 1)
  const issuedAt = Number(issuedAtStr)
  if (!issuedAtStr || !Number.isFinite(issuedAt)) return false
  if (Date.now() - issuedAt > COOKIE_MAX_AGE_SECONDS * 1000) return false
  return receivedHmac === hashPassword(issuedAtStr)
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
