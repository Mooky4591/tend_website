'use client'

import { useState } from 'react'
import { CONSENT_LANGUAGE, TERMS_URL, PRIVACY_POLICY_URL } from '@/lib/sms-consent'
import { isValidPhone, isValidEmail } from '@/lib/validators'
import { submitSmsEnrollment } from '@/lib/api/client'

interface FormState {
  full_name: string
  phone: string
  email: string
  home_address: string
  warranty_provider: string
  system_or_appliance: string
  sms_consent: boolean
}

const empty: FormState = {
  full_name: '',
  phone: '',
  email: '',
  home_address: '',
  warranty_provider: '',
  system_or_appliance: '',
  sms_consent: false,
}

interface FieldErrors {
  full_name?: string
  phone?: string
  email?: string
  home_address?: string
  warranty_provider?: string
}

export default function SmsEnrollmentForm() {
  const [form, setForm] = useState<FormState>(empty)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function set(field: keyof FormState, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function validate(): boolean {
    const errs: FieldErrors = {}
    if (!form.full_name.trim()) errs.full_name = 'Full name is required'
    if (!form.phone.trim()) {
      errs.phone = 'Mobile phone number is required'
    } else if (!isValidPhone(form.phone)) {
      errs.phone = 'Enter a valid phone number (at least 10 digits)'
    }
    if (form.email.trim() && !isValidEmail(form.email.trim())) {
      errs.email = 'Enter a valid email address'
    }
    if (!form.home_address.trim()) errs.home_address = 'Home address is required'
    if (!form.warranty_provider.trim()) errs.warranty_provider = 'Warranty provider is required'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await submitSmsEnrollment(form)
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Submission failed. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div role="status" className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <svg className="mx-auto mb-4 h-12 w-12 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-foreground">Enrollment submitted</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {form.sms_consent
            ? 'You have opted in to Tendr SMS messages. Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help.'
            : 'Your information has been received. You have not opted in to SMS messages.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && (
        <div role="alert" className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-muted-foreground mb-1.5">
          Full Name <span aria-hidden="true" className="text-error">*</span>
        </label>
        <input
          id="full_name"
          type="text"
          required
          autoComplete="name"
          aria-invalid={!!fieldErrors.full_name}
          aria-describedby={fieldErrors.full_name ? 'full_name-error' : undefined}
          value={form.full_name}
          onChange={e => set('full_name', e.target.value)}
          className="w-full rounded-lg border border-border/30 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Jane Homeowner"
        />
        {fieldErrors.full_name && <p id="full_name-error" role="alert" className="mt-1 text-xs text-error">{fieldErrors.full_name}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-1.5">
          Mobile Phone Number <span aria-hidden="true" className="text-error">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          required
          autoComplete="tel"
          aria-invalid={!!fieldErrors.phone}
          aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          className="w-full rounded-lg border border-border/30 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="(555) 123-4567"
        />
        {fieldErrors.phone && <p id="phone-error" role="alert" className="mt-1 text-xs text-error">{fieldErrors.phone}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1.5">
          Email Address <span className="text-muted-foreground/50 font-normal">(optional)</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          value={form.email}
          onChange={e => set('email', e.target.value)}
          className="w-full rounded-lg border border-border/30 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="jane@example.com"
        />
        {fieldErrors.email && <p id="email-error" role="alert" className="mt-1 text-xs text-error">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="home_address" className="block text-sm font-medium text-muted-foreground mb-1.5">
          Home Address <span aria-hidden="true" className="text-error">*</span>
        </label>
        <input
          id="home_address"
          type="text"
          required
          autoComplete="street-address"
          aria-invalid={!!fieldErrors.home_address}
          aria-describedby={fieldErrors.home_address ? 'home_address-error' : undefined}
          value={form.home_address}
          onChange={e => set('home_address', e.target.value)}
          className="w-full rounded-lg border border-border/30 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="123 Main St, Atlanta, GA 30301"
        />
        {fieldErrors.home_address && <p id="home_address-error" role="alert" className="mt-1 text-xs text-error">{fieldErrors.home_address}</p>}
      </div>

      <div>
        <label htmlFor="warranty_provider" className="block text-sm font-medium text-muted-foreground mb-1.5">
          Warranty Provider <span aria-hidden="true" className="text-error">*</span>
        </label>
        <input
          id="warranty_provider"
          type="text"
          required
          aria-invalid={!!fieldErrors.warranty_provider}
          aria-describedby={fieldErrors.warranty_provider ? 'warranty_provider-error' : undefined}
          value={form.warranty_provider}
          onChange={e => set('warranty_provider', e.target.value)}
          className="w-full rounded-lg border border-border/30 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="e.g. American Home Shield"
        />
        {fieldErrors.warranty_provider && <p id="warranty_provider-error" role="alert" className="mt-1 text-xs text-error">{fieldErrors.warranty_provider}</p>}
      </div>

      <div>
        <label htmlFor="system_or_appliance" className="block text-sm font-medium text-muted-foreground mb-1.5">
          Home System or Appliance <span className="text-muted-foreground/50 font-normal">(optional)</span>
        </label>
        <input
          id="system_or_appliance"
          type="text"
          value={form.system_or_appliance}
          onChange={e => set('system_or_appliance', e.target.value)}
          className="w-full rounded-lg border border-border/30 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="e.g. HVAC, Water Heater"
        />
      </div>

      {/* A2P SMS consent — must remain unchecked by default */}
      <div className="rounded-xl border border-border/20 bg-muted p-4">
        <label className="flex items-start gap-3">
          <input
            id="sms_consent"
            type="checkbox"
            checked={form.sms_consent}
            onChange={e => set('sms_consent', e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border/30 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm leading-6 text-muted-foreground">{CONSENT_LANGUAGE}</span>
        </label>
        <div className="mt-3 space-y-1 pl-7 text-sm text-muted-foreground/80">
          <p>
            Terms:{' '}
            <a href={TERMS_URL} className="text-brand-700 underline hover:text-brand-900">
              {TERMS_URL}
            </a>
          </p>
          <p>
            Privacy Policy:{' '}
            <a href={PRIVACY_POLICY_URL} className="text-brand-700 underline hover:text-brand-900">
              {PRIVACY_POLICY_URL}
            </a>
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:w-auto"
      >
        {submitting ? 'Submitting…' : 'Enroll in Tendr SMS'}
      </button>
    </form>
  )
}
