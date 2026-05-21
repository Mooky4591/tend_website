import { sendAdminAlert } from '@/lib/services/alerts'

// Mock @sendgrid/mail
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}))

// Mock @/lib/supabase/service so sendAdminAlert creates a controlled client
const mockInsertFn = jest.fn().mockResolvedValue({ error: null })
const mockServiceClient = {
  from: jest.fn().mockReturnValue({ insert: mockInsertFn }),
}
jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(() => mockServiceClient),
}))

import sgMail from '@sendgrid/mail'
import { createServiceClient } from '@/lib/supabase/service'

const ORIGINAL_ENV = { ...process.env }

describe('sendAdminAlert', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Re-attach insert mock after clearAllMocks wipes mockReturnValue
    mockServiceClient.from.mockReturnValue({ insert: mockInsertFn })
    mockInsertFn.mockResolvedValue({ error: null })
    ;(sgMail.send as jest.Mock).mockResolvedValue([{ statusCode: 202 }])
    ;(createServiceClient as jest.Mock).mockReturnValue(mockServiceClient)
    process.env.ADMIN_EMAIL = 'admin@test.com'
    process.env.SENDGRID_API_KEY = 'SG.test'
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('inserts a system_alerts row with correct fields', async () => {
    await sendAdminAlert('api_failure', 'user-123', 'Test description')

    expect(mockServiceClient.from).toHaveBeenCalledWith('system_alerts')
    expect(mockInsertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        alert_type: 'api_failure',
        user_id: 'user-123',
        description: 'Test description',
        resolved: false,
      }),
    )
  })

  it('sends an email via sgMail.send when both env vars are set', async () => {
    await sendAdminAlert('delivery_failure', null, 'SMS failed')

    expect(sgMail.setApiKey).toHaveBeenCalledWith('SG.test')
    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@test.com',
        subject: '[Tendr Alert] delivery_failure',
      }),
    )
  })

  it('does NOT send email when ADMIN_EMAIL is missing', async () => {
    delete process.env.ADMIN_EMAIL
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    await sendAdminAlert('api_failure', null, 'Test')

    expect(sgMail.send).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('ADMIN_EMAIL'))
    warnSpy.mockRestore()
  })

  it('does NOT send email when SENDGRID_API_KEY is missing', async () => {
    delete process.env.SENDGRID_API_KEY
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    await sendAdminAlert('api_failure', null, 'Test')

    expect(sgMail.send).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('does NOT throw when sgMail.send rejects', async () => {
    ;(sgMail.send as jest.Mock).mockRejectedValueOnce(new Error('SendGrid error'))
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    await expect(sendAdminAlert('api_failure', null, 'Test')).resolves.toBeUndefined()
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[Alerts]'), expect.any(Error))
    errorSpy.mockRestore()
  })

  it('does NOT throw when Supabase insert fails', async () => {
    ;(createServiceClient as jest.Mock).mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      }),
    })
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    await expect(sendAdminAlert('api_failure', null, 'Test')).resolves.toBeUndefined()
    errorSpy.mockRestore()
  })

  it('email subject contains the alertType', async () => {
    await sendAdminAlert('onboarding_stuck', null, 'Test')

    const callArg = (sgMail.send as jest.Mock).mock.calls[0][0]
    expect(callArg.subject).toContain('onboarding_stuck')
  })

  it('email body contains the userId when provided', async () => {
    await sendAdminAlert('api_failure', 'user-abc', 'Test')

    const callArg = (sgMail.send as jest.Mock).mock.calls[0][0]
    expect(callArg.text).toContain('user-abc')
  })

  it('email body does NOT contain a userId line when userId is null', async () => {
    await sendAdminAlert('api_failure', null, 'Test')

    const callArg = (sgMail.send as jest.Mock).mock.calls[0][0]
    expect(callArg.text).not.toContain('User ID:')
  })
})
