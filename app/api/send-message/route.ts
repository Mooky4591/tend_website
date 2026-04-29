import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, message } = await request.json() as { userId?: string; message?: string }
  if (!userId || !message?.trim()) {
    return NextResponse.json({ error: 'userId and message are required' }, { status: 400 })
  }

  // RLS ensures this only returns a user in the caller's tenant
  const { data: homeowner } = await supabase
    .from('users')
    .select('phone_number, tenant_id')
    .eq('id', userId)
    .single()

  if (!homeowner) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: tenant } = await supabase
    .from('tenants')
    .select('twilio_phone_number')
    .eq('id', homeowner.tenant_id)
    .single()

  if (!tenant?.twilio_phone_number) {
    return NextResponse.json({ error: 'Tenant has no Twilio number configured' }, { status: 500 })
  }

  const smsError = await sendSms(tenant.twilio_phone_number, homeowner.phone_number, message.trim())
    .then(() => null)
    .catch((err: unknown) => err)

  if (smsError) {
    return NextResponse.json({ error: 'SMS delivery failed' }, { status: 502 })
  }

  const { error: insertError } = await supabase.from('conversations').insert({
    user_id: userId,
    tenant_id: homeowner.tenant_id,
    role: 'staff',
    content: message.trim(),
  })

  if (insertError) {
    return NextResponse.json(
      { error: 'Message sent but could not be saved: ' + insertError.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
