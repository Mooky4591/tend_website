/**
 * @jest-environment node
 */

import { POST } from '@/app/api/sms-enrollment/route'
import { NextRequest } from 'next/server'
import { CONSENT_LANGUAGE, CONSENT_LANGUAGE_VERSION, TERMS_URL, PRIVACY_POLICY_URL, ENROLLMENT_SOURCE_URL } from '@/lib/sms-consent'

const mockInsert = jest.fn()

const defaultHeaderValues: Record<string, string | null> = {
  'x-forwarded-for': '1.2.3.4',
  'user-agent': 'TestAgent/1.0',
}
const mockHeaderGet = jest.fn((key: string) => defaultHeaderValues[key] ?? null)

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: () => ({ insert: mockInsert }),
  }),
}))

jest.mock('next/headers', () => ({
  headers: () => ({ get: (key: string) => mockHeaderGet(key) }),
}))

const validBody = {
  first_name: 'Jane',
  last_name: 'Homeowner',
  phone: '5551234567',
  email: 'jane@example.com',
  home_address: '123 Main St',
  warranty_provider: 'American Home Shield',
  system_or_appliance: 'HVAC',
  sms_consent: true,
}

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/sms-enrollment', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockInsert.mockResolvedValue({ error: null })
  mockHeaderGet.mockImplementation((key: string) => defaultHeaderValues[key] ?? null)
})

describe('POST /api/sms-enrollment', () => {
  it('returns 201 on valid submission with sms_consent true', async () => {
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('stores sms_consent: true when checkbox is checked', async () => {
    await POST(makeRequest({ ...validBody, sms_consent: true }))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ sms_consent: true }))
  })

  it('stores sms_consent: false when checkbox is unchecked', async () => {
    await POST(makeRequest({ ...validBody, sms_consent: false }))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ sms_consent: false }))
  })

  it('coerces missing sms_consent to false', async () => {
    const { sms_consent: _, ...body } = validBody
    await POST(makeRequest(body))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ sms_consent: false }))
  })

  it('returns 400 when first_name is missing', async () => {
    const { first_name: _, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
  })

  it('returns 400 when last_name is missing', async () => {
    const { last_name: _, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
  })

  it('returns 400 when phone is missing', async () => {
    const { phone: _, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
  })

  it('returns 400 when home_address is missing', async () => {
    const { home_address: _, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
  })

  it('returns 400 when warranty_provider is missing', async () => {
    const { warranty_provider: _, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
  })

  it('returns 400 when required fields are blank strings', async () => {
    const res = await POST(makeRequest({ ...validBody, first_name: '   ' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when last_name is a blank string', async () => {
    const res = await POST(makeRequest({ ...validBody, last_name: '   ' }))
    expect(res.status).toBe(400)
  })

  it('400 body names only the missing field when one required field is blank', async () => {
    const res = await POST(makeRequest({ ...validBody, last_name: '' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('last_name is required')
  })

  it('400 body lists every missing field with "are required" when multiple are blank', async () => {
    const { last_name: _l, home_address: _h, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('last_name, home_address are required')
  })

  it('writes first_name, last_name, and a computed full_name to the row', async () => {
    await POST(makeRequest(validBody))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      first_name: 'Jane',
      last_name: 'Homeowner',
      full_name: 'Jane Homeowner',
    }))
  })

  it('stores IP address and user agent from headers', async () => {
    await POST(makeRequest(validBody))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      ip_address: '1.2.3.4',
      user_agent: 'TestAgent/1.0',
    }))
  })

  it('stores the correct consent language and version', async () => {
    await POST(makeRequest(validBody))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      consent_language: CONSENT_LANGUAGE,
      consent_language_version: CONSENT_LANGUAGE_VERSION,
    }))
  })

  it('stores correct terms, privacy policy, and source URLs', async () => {
    await POST(makeRequest(validBody))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      terms_url: TERMS_URL,
      privacy_policy_url: PRIVACY_POLICY_URL,
      consent_source_url: ENROLLMENT_SOURCE_URL,
    }))
  })

  it('trims whitespace and normalizes phone to E.164 before storing', async () => {
    await POST(makeRequest({
      ...validBody,
      first_name: '  Jane  ',
      last_name: '  Homeowner  ',
      phone: ' 5551234567 ',
    }))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      first_name: 'Jane',
      last_name: 'Homeowner',
      full_name: 'Jane Homeowner',
      phone: '+15551234567',
    }))
  })

  it('normalizes an 11-digit phone starting with 1 to E.164', async () => {
    await POST(makeRequest({ ...validBody, phone: '15551234567' }))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ phone: '+15551234567' }))
  })

  it('returns 400 when email is provided but malformed', async () => {
    const res = await POST(makeRequest({ ...validBody, email: 'not-an-email' }))
    expect(res.status).toBe(400)
  })

  it('accepts a valid email when provided', async () => {
    const res = await POST(makeRequest({ ...validBody, email: 'jane@example.com' }))
    expect(res.status).toBe(201)
  })

  it('stores null for optional fields when omitted', async () => {
    const { email: _, system_or_appliance: __, ...body } = validBody
    await POST(makeRequest(body))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      email: null,
      system_or_appliance: null,
    }))
  })

  it('returns 400 for a malformed (non-JSON) request body', async () => {
    const req = new NextRequest('http://localhost/api/sms-enrollment', {
      method: 'POST',
      body: '{invalid json',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when phone contains no dialable digits', async () => {
    const res = await POST(makeRequest({ ...validBody, phone: 'not-a-phone' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when phone has fewer than 10 digits', async () => {
    const res = await POST(makeRequest({ ...validBody, phone: '12345' }))
    expect(res.status).toBe(400)
  })

  it('accepts a phone with formatting characters', async () => {
    const res = await POST(makeRequest({ ...validBody, phone: '(555) 123-4567' }))
    expect(res.status).toBe(201)
  })

  it('returns 500 when the DB insert fails', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'constraint violation' } })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(500)
  })

  it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
    mockHeaderGet.mockImplementation((key: string) => {
      if (key === 'x-real-ip') return '9.8.7.6'
      if (key === 'user-agent') return 'TestAgent/1.0'
      return null // x-forwarded-for returns null
    })
    await POST(makeRequest(validBody))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ ip_address: '9.8.7.6' }))
  })

  it('stores null for ip_address when both x-forwarded-for and x-real-ip are absent', async () => {
    mockHeaderGet.mockImplementation((key: string) => {
      if (key === 'user-agent') return 'TestAgent/1.0'
      return null
    })
    await POST(makeRequest(validBody))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ ip_address: null }))
  })

  it('stores null for user_agent when the user-agent header is absent', async () => {
    mockHeaderGet.mockImplementation((key: string) => {
      if (key === 'x-forwarded-for') return '1.2.3.4'
      return null // user-agent header missing
    })
    await POST(makeRequest(validBody))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ user_agent: null }))
  })
})
