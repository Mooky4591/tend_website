import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendMessageToHomeowner } from '@/lib/services/messaging'
import { unauthorized, badRequest, notFound, serverError, badGateway, ok } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { userId, message } = await request.json() as { userId?: string; message?: string }
  if (!userId || !message?.trim()) {
    return badRequest('userId and message are required')
  }

  const err = await sendMessageToHomeowner(supabase, userId, message.trim())
  if (err) {
    if (err.status === 404) return notFound(err.error)
    if (err.status === 502) return badGateway(err.error)
    return serverError(err.error)
  }

  return ok({ ok: true })
}
