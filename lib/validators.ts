export type PhoneValidation = { value: string } | { error: string }

export function normalizePhone(raw: string): PhoneValidation {
  const digits = raw.trim().replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) {
    return { error: 'phone must be a valid dialable number' }
  }
  return { value: digits.length === 10 ? `+1${digits}` : `+${digits}` }
}

export function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 10
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
