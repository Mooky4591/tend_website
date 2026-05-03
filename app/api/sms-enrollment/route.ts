import { NextRequest, NextResponse } from 'next/server'
import { buildRateLimitKey, checkRateLimit, getTrustedClientIp } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'

const CONSENT_LANGUAGE_VERSION = 'tendr-sms-consent-v1'
const TERMS_URL = 'https://trytendr.org/terms'
const PRIVACY_URL = 'https://trytendr.org/privacy-policy'
const SOURCE_URL = 'https://trytendr.org/sms-enrollment'

const RATE_LIMIT_WINDOW_SECONDS = 15 * 60
const RATE_LIMIT_MAX_ATTEMPTS = 8

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (!origin || !host) return false

  try {
    const originUrl = new URL(origin)
    return originUrl.host === host
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.redirect(new URL('/sms-enrollment?status=invalid-origin', request.url), { status: 303 })
  }

  const form = await request.formData()
  const website = String(form.get('website') ?? '').trim()

  if (website) {
    return NextResponse.redirect(new URL('/sms-enrollment?status=success', request.url), { status: 303 })
  }

  const fullName = String(form.get('fullName') ?? '').trim()
  const mobilePhone = String(form.get('mobilePhone') ?? '').trim()
  const email = String(form.get('email') ?? '').trim() || null
  const homeAddress = String(form.get('homeAddress') ?? '').trim()
  const warrantyProvider = String(form.get('warrantyProvider') ?? '').trim()
  const homeSystemOrAppliance = String(form.get('homeSystemOrAppliance') ?? '').trim() || null
  const smsConsent = form.get('smsConsent') === 'on'

  if (!fullName || !mobilePhone || !homeAddress || !warrantyProvider) {
    return NextResponse.redirect(new URL('/sms-enrollment?status=missing-required', request.url), { status: 303 })
  }

  if (!smsConsent) {
    return NextResponse.redirect(new URL('/sms-enrollment?status=no-consent', request.url), { status: 303 })
  }

  const userAgent = request.headers.get('user-agent')
  const { ip, source } = getTrustedClientIp(request)

  const supabase = createAdminClient()
  const fingerprint = buildRateLimitKey('sms-enrollment', ip, null)
  const { allowed } = await checkRateLimit(supabase, fingerprint, {
    maxAttempts: RATE_LIMIT_MAX_ATTEMPTS,
    windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
  })

  if (!allowed) {
    return NextResponse.redirect(new URL('/sms-enrollment?status=rate-limited', request.url), { status: 303 })
  }

  const { error } = await supabase.from('sms_opt_ins').insert({
    full_name: fullName,
    mobile_phone: mobilePhone,
    email,
    home_address: homeAddress,
    warranty_provider: warrantyProvider,
    home_system_or_appliance: homeSystemOrAppliance,
    consent_timestamp: new Date().toISOString(),
    consent_source_url: SOURCE_URL,
    consent_language_version: CONSENT_LANGUAGE_VERSION,
    terms_url: TERMS_URL,
    privacy_policy_url: PRIVACY_URL,
    ip_address: ip,
    user_agent: userAgent,
    ip_source: source,
  })

  if (error) {
    return NextResponse.redirect(new URL('/sms-enrollment?status=error', request.url), { status: 303 })
  }

  return NextResponse.redirect(new URL('/sms-enrollment?status=success', request.url), { status: 303 })
}
