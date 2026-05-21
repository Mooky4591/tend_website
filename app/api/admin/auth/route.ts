import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, validSessionToken, adminCookieOptions, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

/**
 * POST /api/admin/auth
 * Validates the submitted password and sets/clears the admin session cookie.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const password = formData.get('password')
  const action = formData.get('action')

  // Logout
  if (action === 'logout') {
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.set(ADMIN_COOKIE_NAME, '', { ...adminCookieOptions, maxAge: 0 })
    return response
  }

  if (typeof password !== 'string' || !password) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('error', 'Password is required')
    return NextResponse.redirect(url)
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('error', 'Admin access is not configured')
    return NextResponse.redirect(url)
  }

  const submittedHash = hashPassword(password)
  const expectedHash = validSessionToken()

  if (submittedHash !== expectedHash) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('error', 'Incorrect password')
    return NextResponse.redirect(url)
  }

  const response = NextResponse.redirect(new URL('/admin', request.url))
  response.cookies.set(ADMIN_COOKIE_NAME, expectedHash, adminCookieOptions)
  return response
}
