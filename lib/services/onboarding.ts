import type { SupabaseClient } from '@supabase/supabase-js'
import { sendSms } from '@/lib/twilio'
import { mapTwilioCodeToFailureReason, type FailureReason } from '@/lib/onboarding-failure'

type ServiceError = { error: string; status: number }

export async function triggerOnboarding(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  message: string,
): Promise<ServiceError | null> {
  const { data: homeowner } = await supabase
    .from('users')
    .select('phone_number, tenant_id')
    .eq('id', userId)
    .single()

  if (!homeowner) return { error: 'User not found', status: 404 }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('twilio_phone_number')
    .eq('id', homeowner.tenant_id)
    .single()

  if (!tenant?.twilio_phone_number) {
    return { error: 'Tenant has no Twilio number configured', status: 500 }
  }

  let twilioErrorCode: number | undefined
  const smsError = await sendSms(tenant.twilio_phone_number, homeowner.phone_number, message)
    .then(() => null)
    .catch((err: unknown) => {
      twilioErrorCode = (err as { code?: number }).code
      return err
    })

  const now = new Date().toISOString()

  if (smsError) {
    const failureReason: FailureReason = mapTwilioCodeToFailureReason(twilioErrorCode)
    await supabase
      .from('users')
      .update({
        onboarding_status: 'failed',
        failure_reason: failureReason,
        last_onboarding_attempt: now,
      })
      .eq('id', userId)
    return { error: 'SMS delivery failed', status: 502 }
  }

  const { error: insertError } = await supabase.from('conversations').insert({
    user_id: userId,
    tenant_id: homeowner.tenant_id,
    role: 'staff',
    content: message,
  })
  if (insertError) return { error: insertError.message, status: 500 }

  const { error: updateError } = await supabase
    .from('users')
    .update({
      onboarding_status: 'queued',
      failure_reason: null,
      last_onboarding_attempt: now,
    })
    .eq('id', userId)
  if (updateError) return { error: updateError.message, status: 500 }

  return null
}
