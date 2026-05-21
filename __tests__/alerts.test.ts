import { sendAdminAlert } from '@/lib/services/alerts'

// Mock @sendgrid/mail
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}))

import sgMail from '@sendgrid/mail'

function makeSupabase(insertError: { message: string } | null = null) {
  const insertFn = jest.fn().mockResolvedValue({ error: insertError })
  return {
    from: jest.fn().mockReturnValue({ insert: insertFn }),
    _insertFn: insertFn,
  }
}

const ORIGINAL_ENV = { ...process.env }

describe('sendAdminAlert', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_EMAIL = 'admin@test.com'
    process.env.SENDGRID_API_KEY = 'SG.test'
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('inserts a system_alerts row with correct fields', async () => {
    const supabase = makeSupabase()
    await sendAdminAlert(supabase as unknown as Parameters<typeof sendAdminAlert>[0], 'api_failure', 'user-123', 'Test description')

    expect(supabase.from).toHaveBeenCalledWith('system_alerts')
    expect(supabase._insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        alert_type: 'api_failure',
        user_id: 'user-123',
        description: 'Test description',
        resolved: false,
      }),
    )
  })

  it('sends an email via sgMail.send when both env vars are set', async () => {
    const supabase = makeSupabase()
    await sendAdminAlert(supabase as unknown as Parameters<typeof sendAdminAlert>[0], 'delivery_failure', null, 'SMS failed')

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
    const supabase = makeSupabase()
    await sendAdminAlert(supabase as unknown as Parameters<typeof sendAdminAlert>[0], 'api_failure', null, 'Test')

    expect(sgMail.send).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('ADMIN_EMAIL'))
    warnSpy.mockRestore()
  })

  it('does NOT send email when SENDGRID_API_KEY is missing', async () => {
    delete process.env.SENDGRID_API_KEY
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const supabase = makeSupabase()
    await sendAdminAlert(supabase as unknown as Parameters<typeof sendAdminAlert>[0], 'api_failure', null, 'Test')

    expect(sgMail.send).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('does NOT throw when sgMail.send rejects', async () => {
    ;(sgMail.send as jest.Mock).mockRejectedValueOnce(new Error('SendGrid error'))
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const supabase = makeSupabase()
    await expect(
      sendAdminAlert(supabase as unknown as Parameters<typeof sendAdminAlert>[0], 'api_failure', null, 'Test'),
    ).resolves.toBeUndefined()
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[Alerts]'), expect.any(Error))
    errorSpy.mockRestore()
  })

  it('does NOT throw when Supabase insert fails', async () => {
    const supabase = makeSupabase({ message: 'DB error' })
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      sendAdminAlert(supabase as unknown as Parameters<typeof sendAdminAlert>[0], 'api_failure', null, 'Test'),
    ).resolves.toBeUndefined()
    errorSpy.mockRestore()
  })

  it('email subject contains the alertType', async () => {
    const supabase = makeSupabase()
    await sendAdminAlert(supabase as unknown as Parameters<typeof sendAdminAlert>[0], 'onboarding_stuck', null, 'Test')

    const callArg = (sgMail.send as jest.Mock).mock.calls[0][0]
    expect(callArg.subject).toContain('onboarding_stuck')
  })

  it('email body contains the userId when provided', async () => {
    const supabase = makeSupabase()
    await sendAdminAlert(supabase as unknown as Parameters<typeof sendAdminAlert>[0], 'api_failure', 'user-abc', 'Test')

    const callArg = (sgMail.send as jest.Mock).mock.calls[0][0]
    expect(callArg.text).toContain('user-abc')
  })

  it('email body does NOT contain a userId line when userId is null', async () => {
    const supabase = makeSupabase()
    await sendAdminAlert(supabase as unknown as Parameters<typeof sendAdminAlert>[0], 'api_failure', null, 'Test')

    const callArg = (sgMail.send as jest.Mock).mock.calls[0][0]
    expect(callArg.text).not.toContain('User ID:')
  })
})
