import { normalizePhone, isValidPhone, isValidEmail } from '@/lib/validators'

describe('normalizePhone', () => {
  it('returns { value } with +1 prefix for a 10-digit US number', () => {
    expect(normalizePhone('5551234567')).toEqual({ value: '+15551234567' })
  })

  it('handles formatting characters like (555) 123-4567', () => {
    expect(normalizePhone('(555) 123-4567')).toEqual({ value: '+15551234567' })
  })

  it('returns { error } for fewer than 10 digits', () => {
    expect(normalizePhone('12345')).toHaveProperty('error')
  })

  it('returns { error } for more than 15 digits', () => {
    expect(normalizePhone('1234567890123456')).toHaveProperty('error')
  })

  it('prepends + (not +1) for an 11-digit number', () => {
    expect(normalizePhone('15551234567')).toEqual({ value: '+15551234567' })
  })

  it('prepends + for an international number longer than 10 digits', () => {
    expect(normalizePhone('441234567890')).toEqual({ value: '+441234567890' })
  })
})

describe('isValidPhone', () => {
  it('returns true for a 10-digit number', () => {
    expect(isValidPhone('5551234567')).toBe(true)
  })

  it('returns false for fewer than 10 digits', () => {
    expect(isValidPhone('12345')).toBe(false)
  })

  it('strips non-digit characters before checking', () => {
    expect(isValidPhone('(555) 123-4567')).toBe(true)
  })
})

describe('isValidEmail', () => {
  it('returns true for a valid email', () => {
    expect(isValidEmail('jane@example.com')).toBe(true)
  })

  it('returns false for a string without @', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
  })

  it('returns false for a string missing a TLD', () => {
    expect(isValidEmail('jane@example')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })
})
