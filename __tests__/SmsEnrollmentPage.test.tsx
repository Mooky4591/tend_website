import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SmsEnrollmentForm from '@/app/sms-enrollment/SmsEnrollmentForm'
import { CONSENT_LANGUAGE, TERMS_URL, PRIVACY_POLICY_URL } from '@/lib/sms-consent'

global.fetch = jest.fn()
const mockFetch = global.fetch as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
})

describe('SmsEnrollmentForm', () => {
  it('renders the heading fields and submit button', () => {
    render(<SmsEnrollmentForm />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mobile phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/home address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/warranty provider/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/home system or appliance/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enroll in tendr sms/i })).toBeInTheDocument()
  })

  it('SMS consent checkbox is unchecked by default', () => {
    render(<SmsEnrollmentForm />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders the full A2P consent language', () => {
    render(<SmsEnrollmentForm />)
    expect(screen.getByText(CONSENT_LANGUAGE)).toBeInTheDocument()
  })

  it('renders the Terms link with correct href', () => {
    render(<SmsEnrollmentForm />)
    const link = screen.getByRole('link', { name: TERMS_URL })
    expect(link).toHaveAttribute('href', TERMS_URL)
  })

  it('renders the Privacy Policy link with correct href', () => {
    render(<SmsEnrollmentForm />)
    const link = screen.getByRole('link', { name: PRIVACY_POLICY_URL })
    expect(link).toHaveAttribute('href', PRIVACY_POLICY_URL)
  })

  it('allows the consent checkbox to be toggled', () => {
    render(<SmsEnrollmentForm />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('submits with sms_consent: true when checkbox is checked', async () => {
    render(<SmsEnrollmentForm />)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Homeowner' } })
    fireEvent.change(screen.getByLabelText(/mobile phone/i), { target: { value: '5551234567' } })
    fireEvent.change(screen.getByLabelText(/home address/i), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText(/warranty provider/i), { target: { value: 'AHS' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /enroll in tendr sms/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.sms_consent).toBe(true)
  })

  it('submits with sms_consent: false when checkbox is left unchecked', async () => {
    render(<SmsEnrollmentForm />)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Homeowner' } })
    fireEvent.change(screen.getByLabelText(/mobile phone/i), { target: { value: '5551234567' } })
    fireEvent.change(screen.getByLabelText(/home address/i), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText(/warranty provider/i), { target: { value: 'AHS' } })
    fireEvent.click(screen.getByRole('button', { name: /enroll in tendr sms/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.sms_consent).toBe(false)
  })

  it('shows the opted-in success message when consent was given', async () => {
    render(<SmsEnrollmentForm />)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText(/mobile phone/i), { target: { value: '5551234567' } })
    fireEvent.change(screen.getByLabelText(/home address/i), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText(/warranty provider/i), { target: { value: 'AHS' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /enroll in tendr sms/i }))

    await waitFor(() => screen.getByRole('status'))
    expect(screen.getByText(/opted in to tendr sms messages/i)).toBeInTheDocument()
  })

  it('shows the no-consent success message when checkbox was left unchecked', async () => {
    render(<SmsEnrollmentForm />)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText(/mobile phone/i), { target: { value: '5551234567' } })
    fireEvent.change(screen.getByLabelText(/home address/i), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText(/warranty provider/i), { target: { value: 'AHS' } })
    fireEvent.click(screen.getByRole('button', { name: /enroll in tendr sms/i }))

    await waitFor(() => screen.getByRole('status'))
    expect(screen.getByText(/have not opted in to sms/i)).toBeInTheDocument()
  })

  it('shows an error message when the API returns an error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'DB error' }) })
    render(<SmsEnrollmentForm />)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText(/mobile phone/i), { target: { value: '5551234567' } })
    fireEvent.change(screen.getByLabelText(/home address/i), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText(/warranty provider/i), { target: { value: 'AHS' } })
    fireEvent.click(screen.getByRole('button', { name: /enroll in tendr sms/i }))

    await waitFor(() => screen.getByRole('alert'))
    expect(screen.getByText('DB error')).toBeInTheDocument()
  })

  it('disables the submit button while submitting', async () => {
    let resolve: (v: unknown) => void
    mockFetch.mockReturnValueOnce(new Promise(r => { resolve = r }))

    render(<SmsEnrollmentForm />)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText(/mobile phone/i), { target: { value: '5551234567' } })
    fireEvent.change(screen.getByLabelText(/home address/i), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText(/warranty provider/i), { target: { value: 'AHS' } })
    fireEvent.click(screen.getByRole('button', { name: /enroll in tendr sms/i }))

    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
    resolve!({ ok: true, json: async () => ({ ok: true }) })
  })
})
