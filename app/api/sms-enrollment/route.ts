import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { normalizePhone, isValidEmail } from '@/lib/validators'
import { badRequest, serverError, created } from '@/lib/api-response'
import {
  CONSENT_LANGUAGE,
  CONSENT_LANGUAGE_VERSION,
  TERMS_URL,
  PRIVACY_POLICY_URL,
  ENROLLMENT_SOURCE_URL,
} from '@/lib/sms-consent'

export interface SmsEnrollmentBody {
  first_name?: string
  last_name?: string
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
    return badRequest('Invalid request body')
  }

  const { first_name, last_name, phone, email, home_address, warranty_provider, system_or_appliance, sms_consent } = body

  const requiredFields: [string, string | undefined][] = [
    ['first_name', first_name],
    ['last_name', last_name],
    ['phone', phone],
    ['home_address', home_address],
    ['warranty_provider', warranty_provider],
  ]
  const missing = requiredFields.filter(([, v]) => !v?.trim()).map(([k]) => k)
  if (missing.length > 0) {
    return badRequest(`${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required`)
  }

  // The `!` assertions are sound: `missing.length === 0` above guarantees each
  // of these required fields has a non-blank string value.
  const firstNameValue = first_name!.trim()
  const lastNameValue = last_name!.trim()

  const phoneResult = normalizePhone(phone!)
  if ('error' in phoneResult) return badRequest(phoneResult.error)

  const emailValue = email?.trim() || null
  if (emailValue && !isValidEmail(emailValue)) {
    return badRequest('email must be a valid email address')
  }

  const h = headers()
  const ip = (h.get('x-forwarded-for')?.split(',')[0]?.trim()) ?? h.get('x-real-ip') ?? null
  const userAgent = h.get('user-agent') ?? null

  const supabase = createClient()

  // full_name is NOT NULL in sms_enrollments for backward compatibility with
  // downstream consumers that have not migrated to first_name + last_name yet.
  // It is derived here from the two new columns, not from the request body.
  const { error } = await supabase.from('sms_enrollments').insert({
    first_name: firstNameValue,
    last_name: lastNameValue,
    full_name: `${firstNameValue} ${lastNameValue}`,
    phone: phoneResult.value,
    email: emailValue,
    home_address: home_address!.trim(),
    warranty_provider: warranty_provider!.trim(),
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

  if (error) return serverError(error.message)

  return created({ ok: true })
}
