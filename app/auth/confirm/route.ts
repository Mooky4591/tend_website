import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function publicOrigin(request: NextRequest): string {
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'localhost'
  return `${proto}://${host}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const origin = publicOrigin(request)

  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const rawNext = searchParams.get('next') ?? ''
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/reset-password'

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }

    return NextResponse.redirect(new URL('/login?error=code_exchange_failed', origin))
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }

    return NextResponse.redirect(new URL('/login?error=otp_verification_failed', origin))
  }

  return NextResponse.redirect(new URL('/login?error=missing_auth_params', origin))
}