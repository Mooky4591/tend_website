import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { triggerOnboarding } from '@/lib/services/onboarding'
import { unauthorized, badRequest, forbidden, notFound, serverError, badGateway, ok } from '@/lib/api-response'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: member, error: memberError } = await supabase
    .from('tenant_users')
    .select('role')
    .eq('auth_user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (memberError) return serverError(memberError.message)
  if (!member) return forbidden('Admin access required')

  let body: { message?: string }
  try {
    body = await request.json() as { message?: string }
  } catch {
    return badRequest('Invalid request body')
  }
  const message = body.message?.trim()
  if (!message) return badRequest('message is required')

  const err = await triggerOnboarding(supabase, params.id, message)
  if (err) {
    if (err.status === 404) return notFound(err.error)
    if (err.status === 502) return badGateway(err.error)
    return serverError(err.error)
  }

  return ok({ ok: true })
}
