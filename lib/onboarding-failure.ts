export type FailureReason =
  | 'invalid_number'
  | 'landline'
  | 'disconnected'
  | 'delivery_timeout'
  | 'network_error'
  | 'carrier_blocked'
  | 'account_error'

// Twilio error codes: https://www.twilio.com/docs/api/errors
const TWILIO_CODE_MAP: Record<number, FailureReason> = {
  21211: 'invalid_number',  // Invalid 'To' phone number
  21217: 'invalid_number',  // Phone number does not appear to be valid
  21614: 'landline',        // 'To' number is not a valid mobile number
  21612: 'disconnected',    // 'To' number is not currently reachable
  30006: 'landline',        // Landline or unreachable carrier (permanent)
  30003: 'delivery_timeout', // Unreachable destination handset (temporary)
  30005: 'delivery_timeout', // Unknown destination handset
  30001: 'network_error',   // Queue overflow
  30008: 'network_error',   // Unknown error
  30004: 'carrier_blocked', // Message blocked
  30007: 'carrier_blocked', // Carrier violation
  20003: 'account_error',   // Permission denied / invalid credentials
}

export function mapTwilioCodeToFailureReason(code: number | undefined): FailureReason {
  if (code !== undefined && code in TWILIO_CODE_MAP) {
    return TWILIO_CODE_MAP[code]
  }
  return 'network_error'
}
