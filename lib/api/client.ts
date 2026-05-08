export async function sendMessage(userId: string, message: string): Promise<Response> {
  return fetch('/api/send-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message }),
  })
}

export async function createReminder(
  userId: string,
  reminderType: string,
  dueDate: string,
): Promise<Response> {
  return fetch('/api/reminders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, reminderType, dueDate }),
  })
}

export async function updateReminder(
  id: string,
  values: { reminderType: string; dueDate: string },
): Promise<Response> {
  return fetch(`/api/reminders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
}

export async function deleteReminder(id: string): Promise<Response> {
  return fetch(`/api/reminders/${id}`, { method: 'DELETE' })
}

export async function uploadWarrantyDoc(planName: string, file: File): Promise<Response> {
  const formData = new FormData()
  formData.set('plan_name', planName)
  formData.set('file', file)
  return fetch('/api/warranty-upload', { method: 'POST', body: formData })
}

export async function submitSmsEnrollment(body: object): Promise<Response> {
  return fetch('/api/sms-enrollment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function updateHomeownerPhone(userId: string, phoneNumber: string): Promise<Response> {
  return fetch(`/api/users/${userId}/phone`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  })
}
