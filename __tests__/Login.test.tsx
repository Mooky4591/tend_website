import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage, { LoginShell } from '@/app/login/page'

const mockSignInWithPassword = jest.fn()
const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockSearchParams = jest.fn(() => new URLSearchParams())

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signInWithPassword: mockSignInWithPassword },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => mockSearchParams(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('LoginPage', () => {
  it('renders email and password fields and a submit button', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('redirects to /dashboard on successful login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null })
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'))
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('shows the error message returned by Supabase on failed login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    })
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'wrong@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('disables the submit button while the request is in flight', async () => {
    let resolve: (v: unknown) => void
    mockSignInWithPassword.mockReturnValueOnce(new Promise(r => { resolve = r }))
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled()
    resolve!({ error: null })
  })

  it('clears a previous error when the form is resubmitted', async () => {
    mockSignInWithPassword
      .mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } })
      .mockResolvedValueOnce({ error: null })

    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(screen.queryByText('Invalid login credentials')).not.toBeInTheDocument())
  })

  it('resets loading state if router.push throws during navigation', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null })
    mockPush.mockImplementationOnce(() => { throw new Error('Navigation failed') })
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign in' })).not.toBeDisabled())
  })

  it('shows a user-friendly error when redirected back with ?error=auth_callback_failed', () => {
    mockSearchParams.mockReturnValueOnce(new URLSearchParams('error=auth_callback_failed'))
    render(<LoginPage />)
    expect(
      screen.getByText('Your sign-in link has expired or is invalid. Please try again.')
    ).toBeInTheDocument()
  })

  it('shows no error on load when the error param is absent', () => {
    render(<LoginPage />)
    expect(screen.queryByText(/expired or is invalid/)).not.toBeInTheDocument()
  })

  it('ignores unknown error param values on load', () => {
    mockSearchParams.mockReturnValueOnce(new URLSearchParams('error=some_unknown_code'))
    render(<LoginPage />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText(/expired or is invalid/)).not.toBeInTheDocument()
  })

  describe('LoginShell fallback', () => {
    it('renders the brand name and a pulsing placeholder card', () => {
      render(<LoginShell />)
      expect(screen.getByText('Tendr')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
      // Skeleton card present but no form inputs
      expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
    })
  })

  it('renders a contact support link', () => {
    render(<LoginPage />)
    const link = screen.getByRole('link', { name: 'Contact support' })
    expect(link).toHaveAttribute('href', 'mailto:support@trytendr.org')
  })
})
