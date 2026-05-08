import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, notFound, serverError, ok } from '@/lib/api-response'

export async function PATCH(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const body = await _request.json() as { phoneNumber?: string }
  const phoneNumber = body.phoneNumber?.trim()
  if (!phoneNumber) return badRequest('Phone number is required')

  const { data, error } = await supabase
    .from('users')
    .update({ phone_number: phoneNumber })
    .eq('id', params.id)
    .select('id, phone_number')
    .single()

  if (error?.code === 'PGRST116') return notFound('Homeowner not found')
  if (error) return serverError(error.message)

  return ok(data)
}
