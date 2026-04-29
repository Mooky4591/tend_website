import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, reminderType, dueDate, unitId } = await request.json() as {
    userId?: string
    reminderType?: string
    dueDate?: string
    unitId?: string
  }

  if (!userId || !reminderType?.trim() || !dueDate) {
    return NextResponse.json({ error: 'userId, reminderType, and dueDate are required' }, { status: 400 })
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
