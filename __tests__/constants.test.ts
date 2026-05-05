import { REMINDER_TYPES } from '@/lib/constants'

describe('REMINDER_TYPES', () => {
  it('is a non-empty array', () => {
    expect(REMINDER_TYPES.length).toBeGreaterThan(0)
  })

  it("contains 'hvac_filter'", () => {
    expect(REMINDER_TYPES).toContain('hvac_filter')
  })

  it("contains 'other'", () => {
    expect(REMINDER_TYPES).toContain('other')
  })

  it('contains only string values', () => {
    REMINDER_TYPES.forEach(t => expect(typeof t).toBe('string'))
  })
})
