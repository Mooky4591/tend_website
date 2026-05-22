import { createServerClient, type SetAllCookies } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Build request headers with x-pathname so Server Components (e.g. AdminLayout)
  // can read the current path without needing client-side hooks.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  // Admin routes use their own cookie-based auth (isAdminAuthenticated), not
  // Supabase. Just forward x-pathname and pass through — no auth redirect here.
  if (pathname.startsWith('/admin')) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Preserve x-pathname when reassigning supabaseResponse after a token rotation.
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    // Copy any cookies set during getUser() onto the redirect so stale tokens
    // are cleared rather than left lingering in the browser.
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
    supabaseResponse.cookies.getAll().forEach(cookie =>
      redirectResponse.cookies.set(cookie)
    )
    return redirectResponse
  }

  const authOnlyPages = ['/login', '/forgot-password']
  if (user && authOnlyPages.includes(request.nextUrl.pathname)) {
    // Copy any refreshed session cookies from supabaseResponse onto the redirect
    // so that token rotations that occurred during getUser() are not discarded.
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
    supabaseResponse.cookies.getAll().forEach(cookie =>
      redirectResponse.cookies.set(cookie)
    )
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/forgot-password', '/admin/:path*'],
}
