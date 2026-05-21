import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, createSessionToken, adminCookieOptions, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

/**
 * POST /api/admin/auth
 * Validates the submitted password and sets/clears the admin session cookie.
 * All redirects use 303 See Other so browsers follow them as GET requests,
 * completing the standard Post/Redirect/Get pattern.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const password = formData.get('password')
  const action = formData.get('action')

  // Logout
  if (action === 'logout') {
    const response = NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 })
    response.cookies.set(ADMIN_COOKIE_NAME, '', { ...adminCookieOptions, maxAge: 0 })
    return response
  }

  if (typeof password !== 'string' || !password) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('error', 'Password is required')
    return NextResponse.redirect(url, { status: 303 })
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('error', 'Admin access is not configured')
    return NextResponse.redirect(url, { status: 303 })
  }

  const submittedHash = hashPassword(password)
  const expectedHash  = hashPassword(adminPassword)

  // Timing-safe comparison: both values are 64-char SHA-256 hex strings (32-byte buffers),
  // so they are always the same length. Using === here would leak timing information per
  // character on this public endpoint.
  if (!crypto.timingSafeEqual(Buffer.from(submittedHash, 'hex'), Buffer.from(expectedHash, 'hex'))) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('error', 'Incorrect password')
    return NextResponse.redirect(url, { status: 303 })
  }

  const sessionToken = createSessionToken()
  const response = NextResponse.redirect(new URL('/admin', request.url), { status: 303 })
  response.cookies.set(ADMIN_COOKIE_NAME, sessionToken, adminCookieOptions)
  return response
}
