export type Reminder = {
  id: string
  reminder_type: string
  due_date: string
  sent: boolean
  skipped_at: string | null
}

export type MessageRole = 'user' | 'assistant' | 'staff'

export type Message = {
  id: string
  role: MessageRole
  content: string
  created_at: string
}
