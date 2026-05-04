import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import {
  CONSENT_LANGUAGE,
  CONSENT_LANGUAGE_VERSION,
  TERMS_URL,
  PRIVACY_POLICY_URL,
  ENROLLMENT_SOURCE_URL,
} from '@/lib/sms-consent'

export interface SmsEnrollmentBody {
  full_name?: string
  phone?: string
  email?: string
  home_address?: string
  warranty_provider?: string
  system_or_appliance?: string
  sms_consent?: boolean
}

export async function POST(request: NextRequest) {
  let body: SmsEnrollmentBody
  try {
    body = await request.json() as SmsEnrollmentBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { full_name, phone, email, home_address, warranty_provider, system_or_appliance, sms_consent } = body

  if (!full_name?.trim() || !phone?.trim() || !home_address?.trim() || !warranty_provider?.trim()) {
    return NextResponse.json(
      { error: 'full_name, phone, home_address, and warranty_provider are required' },
      { status: 400 },
    )
  }

  const phoneDigits = phone.trim().replace(/\D/g, '')
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    return NextResponse.json({ error: 'phone must be a valid dialable number' }, { status: 400 })
  }
  // Normalize to E.164: 10-digit US numbers get +1 prefix; all others get + prefix
  const normalizedPhone = phoneDigits.length === 10 ? `+1${phoneDigits}` : `+${phoneDigits}`

  const emailValue = email?.trim() || null
  if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    return NextResponse.json({ error: 'email must be a valid email address' }, { status: 400 })
  }

  const h = headers()
  const ip = (h.get('x-forwarded-for')?.split(',')[0]?.trim()) ?? h.get('x-real-ip') ?? null
  const userAgent = h.get('user-agent') ?? null

  const supabase = createClient()

  const { error } = await supabase.from('sms_enrollments').insert({
    full_name: full_name.trim(),
    phone: normalizedPhone,
    email: emailValue,
    home_address: home_address.trim(),
    warranty_provider: warranty_provider.trim(),
    system_or_appliance: system_or_appliance?.trim() || null,
    sms_consent: sms_consent === true,
    consent_language_version: CONSENT_LANGUAGE_VERSION,
    consent_language: CONSENT_LANGUAGE,
    consent_source_url: ENROLLMENT_SOURCE_URL,
    terms_url: TERMS_URL,
    privacy_policy_url: PRIVACY_POLICY_URL,
    ip_address: ip,
    user_agent: userAgent,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true }, { status: 201 })
}
