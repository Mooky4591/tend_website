import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CONSENT_LANGUAGE_VERSION = 'tendr-sms-consent-v1'
const TERMS_URL = 'https://trytendr.org/terms'
const PRIVACY_URL = 'https://trytendr.org/privacy-policy'
const SOURCE_URL = 'https://trytendr.org/sms-enrollment'

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || null
  const realIp = request.headers.get('x-real-ip')
  return realIp?.trim() || null
}

export async function POST(request: NextRequest) {
  const form = await request.formData()

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

  const supabase = createClient()
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
    ip_address: getClientIp(request),
    user_agent: request.headers.get('user-agent'),
  })

  if (error) {
    return NextResponse.redirect(new URL('/sms-enrollment?status=error', request.url), { status: 303 })
  }

  return NextResponse.redirect(new URL('/sms-enrollment?status=success', request.url), { status: 303 })
}
