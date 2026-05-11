import { mapTwilioCodeToFailureReason } from '@/lib/onboarding-failure'

describe('mapTwilioCodeToFailureReason', () => {
  it.each([
    [21211, 'invalid_number'],
    [21217, 'invalid_number'],
    [21614, 'landline'],
    [21612, 'disconnected'],
    [30006, 'landline'],
    [30003, 'delivery_timeout'],
    [30005, 'delivery_timeout'],
    [30001, 'network_error'],
    [30008, 'network_error'],
    [30004, 'carrier_blocked'],
    [30007, 'carrier_blocked'],
    [20003, 'account_error'],
  ])('maps Twilio code %i to %s', (code, expected) => {
    expect(mapTwilioCodeToFailureReason(code)).toBe(expected)
  })

  it('returns network_error for an unmapped code', () => {
    expect(mapTwilioCodeToFailureReason(99999)).toBe('network_error')
  })

  it('returns network_error when code is undefined', () => {
    expect(mapTwilioCodeToFailureReason(undefined)).toBe('network_error')
  })
})
