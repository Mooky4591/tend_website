import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordPage from '@/app/forgot-password/page'

const mockResetPasswordForEmail = jest.fn()
const mockSignOut = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { resetPasswordForEmail: mockResetPasswordForEmail, signOut: mockSignOut },
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockResetPasswordForEmail.mockResolvedValue({})
  mockSignOut.mockResolvedValue({})
})

describe('ForgotPasswordPage', () => {
  it('renders the email field and submit button', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument()
  })

  it('has a back to sign in link pointing to /login', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '/login')
  })

  it('disables the button and shows "Sending…" while in flight', async () => {
    let resolve: (v: unknown) => void
    mockResetPasswordForEmail.mockReturnValueOnce(new Promise(r => { resolve = r }))
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled()
    resolve!({})
  })

  it('shows the success message after submit regardless of outcome', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(await screen.findByText(
      /If that email is registered, you'll receive a password reset link shortly/
    )).toBeInTheDocument()
  })

  it('shows the success message even when resetPasswordForEmail throws', async () => {
    mockResetPasswordForEmail.mockRejectedValueOnce(new Error('Network error'))
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(await screen.findByText(
      /If that email is registered, you'll receive a password reset link shortly/
    )).toBeInTheDocument()
  })

  it('calls resetPasswordForEmail with the entered email', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'admin@example.com',
      expect.objectContaining({ redirectTo: expect.stringContaining('/auth/callback?next=/reset-password') })
    ))
  })

  it('calls signOut after sending the reset email to clear any lingering session', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1))
  })

  it('success screen has a back to sign in link pointing to /login', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    const link = await screen.findByRole('link', { name: 'Back to sign in' })
    expect(link).toHaveAttribute('href', '/login')
  })
})
