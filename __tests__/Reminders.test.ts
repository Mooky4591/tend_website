/**
 * @jest-environment node
 */

import { POST } from '@/app/api/reminders/route'
import { PATCH, DELETE } from '@/app/api/reminders/[id]/route'
import { NextRequest } from 'next/server'

const mockGetUser = jest.fn()
const mockReminderInsert = jest.fn()
const mockReminderUpdate = jest.fn()
const mockReminderDelete = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      insert: () => ({ select: () => ({ single: mockReminderInsert }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: mockReminderUpdate }) }) }),
      delete: () => ({ eq: mockReminderDelete }),
    }),
  }),
}))

function makeRequest(method: string, body: object) {
  return new NextRequest(`http://localhost/api/reminders`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const REMINDER = { id: 'rem-1', user_id: 'u1', reminder_type: 'hvac_filter', due_date: '2026-06-01', sent: false }

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'staff-1' } } })
  mockReminderInsert.mockResolvedValue({ data: REMINDER, error: null })
  mockReminderUpdate.mockResolvedValue({ data: REMINDER, error: null })
  mockReminderDelete.mockResolvedValue({ error: null })
})

describe('POST /api/reminders', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await POST(makeRequest('POST', { userId: 'u1', reminderType: 'hvac_filter', dueDate: '2026-06-01' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when userId is missing', async () => {
    const res = await POST(makeRequest('POST', { reminderType: 'hvac_filter', dueDate: '2026-06-01' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when reminderType is missing', async () => {
    const res = await POST(makeRequest('POST', { userId: 'u1', dueDate: '2026-06-01' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when dueDate is missing', async () => {
    const res = await POST(makeRequest('POST', { userId: 'u1', reminderType: 'hvac_filter' }))
    expect(res.status).toBe(400)
  })

  it('creates the reminder and returns 201 with the created row', async () => {
    const res = await POST(makeRequest('POST', { userId: 'u1', reminderType: 'hvac_filter', dueDate: '2026-06-01' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.id).toBe('rem-1')
  })

  it('returns 500 when DB insert fails', async () => {
    mockReminderInsert.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })
    const res = await POST(makeRequest('POST', { userId: 'u1', reminderType: 'hvac_filter', dueDate: '2026-06-01' }))
    expect(res.status).toBe(500)
  })
})

describe('PATCH /api/reminders/[id]', () => {
  function makeIdRequest(body: object) {
    return new NextRequest('http://localhost/api/reminders/rem-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await PATCH(makeIdRequest({ dueDate: '2026-07-01' }), { params: { id: 'rem-1' } })
    expect(res.status).toBe(401)
  })

  it('returns 400 when no updatable fields are provided', async () => {
    const res = await PATCH(makeIdRequest({}), { params: { id: 'rem-1' } })
    expect(res.status).toBe(400)
  })

  it('updates the reminder and returns 200', async () => {
    const res = await PATCH(makeIdRequest({ dueDate: '2026-07-01', reminderType: 'hvac_service' }), { params: { id: 'rem-1' } })
    expect(res.status).toBe(200)
  })

  it('returns 404 when the reminder id does not exist', async () => {
    mockReminderUpdate.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'The result contains 0 rows' } })
    const res = await PATCH(makeIdRequest({ dueDate: '2026-07-01' }), { params: { id: 'nonexistent' } })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/reminders/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const req = new NextRequest('http://localhost/api/reminders/rem-1', { method: 'DELETE' })
    const res = await DELETE(req, { params: { id: 'rem-1' } })
    expect(res.status).toBe(401)
  })

  it('deletes the reminder and returns ok:true', async () => {
    const req = new NextRequest('http://localhost/api/reminders/rem-1', { method: 'DELETE' })
    const res = await DELETE(req, { params: { id: 'rem-1' } })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('returns 500 when DB delete fails', async () => {
    mockReminderDelete.mockResolvedValueOnce({ error: { message: 'DB error' } })
    const req = new NextRequest('http://localhost/api/reminders/rem-1', { method: 'DELETE' })
    const res = await DELETE(req, { params: { id: 'rem-1' } })
    expect(res.status).toBe(500)
  })
})
