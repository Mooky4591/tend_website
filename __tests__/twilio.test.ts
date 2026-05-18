/**
 * @jest-environment node
 */

const mockCreate = jest.fn()
const mockTwilioFactory = jest.fn((_sid?: string, _token?: string) => ({
  messages: { create: mockCreate },
}))

jest.mock('twilio', () => ({
  __esModule: true,
  default: (sid?: string, token?: string) => mockTwilioFactory(sid, token),
}))

beforeEach(() => {
  jest.clearAllMocks()
  jest.resetModules()
  process.env.TWILIO_ACCOUNT_SID = 'AC_test_sid'
  process.env.TWILIO_AUTH_TOKEN = 'auth_token_test'
})

describe('sendSms', () => {
  it('calls twilio messages.create with the provided from/to/body', async () => {
    mockCreate.mockResolvedValue({ sid: 'SM123' })
    const { sendSms } = await import('@/lib/twilio')
    await sendSms('+15550000000', '+15551111111', 'hello world')
    expect(mockCreate).toHaveBeenCalledWith({
      from: '+15550000000',
      to: '+15551111111',
      body: 'hello world',
    })
  })

  it('propagates the rejection when messages.create fails', async () => {
    mockCreate.mockRejectedValue(new Error('twilio is down'))
    const { sendSms } = await import('@/lib/twilio')
    await expect(sendSms('+15550000000', '+15551111111', 'oops')).rejects.toThrow('twilio is down')
  })

  it('initializes the twilio client only once across multiple sends', async () => {
    mockCreate.mockResolvedValue({ sid: 'SM' })
    const { sendSms } = await import('@/lib/twilio')
    await sendSms('+15550000000', '+15551111111', 'one')
    await sendSms('+15550000000', '+15551111112', 'two')
    await sendSms('+15550000000', '+15551111113', 'three')
    expect(mockTwilioFactory).toHaveBeenCalledTimes(1)
    expect(mockTwilioFactory).toHaveBeenCalledWith('AC_test_sid', 'auth_token_test')
  })

  it('resolves with undefined on success (discards the MessageInstance return value)', async () => {
    mockCreate.mockResolvedValue({ sid: 'SM_should_be_ignored' })
    const { sendSms } = await import('@/lib/twilio')
    await expect(sendSms('+15550000000', '+15551111111', 'msg')).resolves.toBeUndefined()
  })
})
