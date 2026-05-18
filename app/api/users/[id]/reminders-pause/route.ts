import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, notFound, forbidden, serverError, ok } from '@/lib/api-response'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: member, error: memberError } = await supabase
    .from('tenant_users')
    .select('role, tenant_id')
    .eq('auth_user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (memberError) return serverError(memberError.message)
  if (!member) return forbidden('Admin access required')

  const body = await request.json() as { paused?: unknown }
  if (typeof body.paused !== 'boolean') return badRequest('paused must be a boolean')

  const reminders_paused_at = body.paused ? new Date().toISOString() : null

  const { data, error } = await supabase
    .from('users')
    .update({ reminders_paused_at })
    .eq('id', params.id)
    .eq('tenant_id', member.tenant_id)
    .select('id, reminders_paused_at')
    .single()

  if (error?.code === 'PGRST116') return notFound('Homeowner not found')
  if (error) return serverError(error.message)

  return ok(data)
}
