import type { SupabaseClient } from '@supabase/supabase-js'
import { sendSms } from '@/lib/twilio'
import { sendAdminAlert } from './alerts'

type ServiceError = { error: string; status: number }

export async function sendMessageToHomeowner(
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

  const smsError = await sendSms(tenant.twilio_phone_number, homeowner.phone_number, message)
    .then(() => null)
    .catch((err: unknown) => err)

  if (smsError) {
    await sendAdminAlert(
      'delivery_failure',
      userId,
      `Outbound SMS failed for user ${userId}: ${smsError instanceof Error ? smsError.message : String(smsError)}`,
    )
    return { error: 'SMS delivery failed', status: 502 }
  }

  const { error: insertError } = await supabase.from('conversations').insert({
    user_id: userId,
    tenant_id: homeowner.tenant_id,
    role: 'staff',
    content: message,
  })

  if (insertError) {
    return {
      error: 'Message sent but could not be saved: ' + insertError.message,
      status: 500,
    }
  }

  return null
}
