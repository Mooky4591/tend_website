import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, notFound, serverError, ok } from '@/lib/api-response'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const body = await request.json() as { reminderType?: string; dueDate?: string }
  const updates: Record<string, string> = {}
  if (body.reminderType?.trim()) updates.reminder_type = body.reminderType.trim()
  if (body.dueDate) updates.due_date = body.dueDate

  if (Object.keys(updates).length === 0) {
    return badRequest('No fields to update')
  }

  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error?.code === 'PGRST116') return notFound('Reminder not found')
  if (error) return serverError(error.message)

  return ok(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', params.id)

  if (error) return serverError(error.message)

  return ok({ ok: true })
}
