import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, serverError, created } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { userId, reminderType, dueDate, unitId } = await request.json() as {
    userId?: string
    reminderType?: string
    dueDate?: string
    unitId?: string
  }

  if (!userId || !reminderType?.trim() || !dueDate) {
    return badRequest('userId, reminderType, and dueDate are required')
  }

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: userId,
      reminder_type: reminderType.trim(),
      due_date: dueDate,
      ...(unitId ? { unit_id: unitId } : {}),
    })
    .select()
    .single()

  if (error) return serverError(error.message)

  return created(data)
}
