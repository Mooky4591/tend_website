import {
  sendMessage,
  createReminder,
  updateReminder,
  deleteReminder,
  uploadWarrantyDoc,
  submitSmsEnrollment,
  updateHomeownerPhone,
} from '@/lib/api/client'

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockResolvedValue({ ok: true, status: 200 })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('sendMessage', () => {
  it('POSTs to /api/send-message with JSON body', async () => {
    await sendMessage('u1', 'hello')
    expect(mockFetch).toHaveBeenCalledWith('/api/send-message', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ userId: 'u1', message: 'hello' })
  })

  it('returns the raw Response without throwing on non-2xx', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    const res = await sendMessage('u1', 'hi')
    expect(res).toMatchObject({ ok: false, status: 500 })
  })
})

describe('createReminder', () => {
  it('POSTs to /api/reminders with correct JSON body', async () => {
    await createReminder('u1', 'hvac_filter', '2026-06-01')
    expect(mockFetch).toHaveBeenCalledWith('/api/reminders', expect.objectContaining({ method: 'POST' }))
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
      userId: 'u1',
      reminderType: 'hvac_filter',
      dueDate: '2026-06-01',
    })
  })
})

describe('updateReminder', () => {
  it('PATCHes /api/reminders/:id with correct JSON body', async () => {
    await updateReminder('r1', { reminderType: 'other', dueDate: '2026-07-01' })
    expect(mockFetch).toHaveBeenCalledWith('/api/reminders/r1', expect.objectContaining({ method: 'PATCH' }))
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
      reminderType: 'other',
      dueDate: '2026-07-01',
    })
  })
})

describe('deleteReminder', () => {
  it('DELETEs /api/reminders/:id', async () => {
    await deleteReminder('r1')
    expect(mockFetch).toHaveBeenCalledWith('/api/reminders/r1', { method: 'DELETE' })
  })
})

describe('uploadWarrantyDoc', () => {
  it('POSTs to /api/warranty-upload with FormData containing plan_name and file', async () => {
    const file = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' })
    await uploadWarrantyDoc('My Plan', file)
    expect(mockFetch).toHaveBeenCalledWith('/api/warranty-upload', expect.objectContaining({ method: 'POST' }))
    const formData = mockFetch.mock.calls[0][1].body as FormData
    expect(formData.get('plan_name')).toBe('My Plan')
    expect(formData.get('file')).toBe(file)
  })

  it('does not set an explicit Content-Type header (browser sets multipart boundary)', async () => {
    const file = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' })
    await uploadWarrantyDoc('Plan', file)
    expect(mockFetch.mock.calls[0][1].headers).toBeUndefined()
  })
})

describe('submitSmsEnrollment', () => {
  it('POSTs to /api/sms-enrollment with JSON body', async () => {
    const body = { full_name: 'Jane', phone: '5551234567' }
    await submitSmsEnrollment(body)
    expect(mockFetch).toHaveBeenCalledWith('/api/sms-enrollment', expect.objectContaining({ method: 'POST' }))
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual(body)
  })
})

describe('updateHomeownerPhone', () => {
  it('PATCHes /api/users/:id/phone with phoneNumber JSON body', async () => {
    await updateHomeownerPhone('u1', '+15559999999')
    expect(mockFetch).toHaveBeenCalledWith('/api/users/u1/phone', expect.objectContaining({ method: 'PATCH' }))
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ phoneNumber: '+15559999999' })
  })
})
