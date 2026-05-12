import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChangePasswordPage from '@/app/dashboard/settings/change-password/page'

const mockSignInWithPassword = jest.fn()
const mockUpdateUser = jest.fn()
const mockGetUser = jest.fn()
const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
      updateUser: mockUpdateUser,
    },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { email: 'user@example.com' } } })
  mockSignInWithPassword.mockResolvedValue({ error: null })
  mockUpdateUser.mockResolvedValue({ error: null })
})

async function fillForm({
  current = 'oldpass',
  newPass = 'newpass123',
  confirm = 'newpass123',
}: { current?: string; newPass?: string; confirm?: string } = {}) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Current password'), current)
  await user.type(screen.getByLabelText('New password'), newPass)
  await user.type(screen.getByLabelText('Confirm new password'), confirm)
  return user
}

describe('ChangePasswordPage', () => {
  it('renders all three password fields', () => {
    render(<ChangePasswordPage />)
    expect(screen.getByLabelText('Current password')).toBeInTheDocument()
    expect(screen.getByLabelText('New password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument()
  })

  it('renders the submit button and cancel link', () => {
    render(<ChangePasswordPage />)
    expect(screen.getByRole('button', { name: 'Update password' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/dashboard')
  })

  it('shows error when new password and confirm password do not match', async () => {
    render(<ChangePasswordPage />)
    const user = await fillForm({ newPass: 'newpass123', confirm: 'different' })

    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('New passwords do not match.')
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('shows error when current password is incorrect', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } })
    render(<ChangePasswordPage />)
    const user = await fillForm()

    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Current password is incorrect.')
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('shows Supabase error message when updateUser fails', async () => {
    mockUpdateUser.mockResolvedValueOnce({ error: { message: 'Password should be at least 6 characters.' } })
    render(<ChangePasswordPage />)
    const user = await fillForm()

    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Password should be at least 6 characters.')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows success message and redirects to /dashboard on success', async () => {
    render(<ChangePasswordPage />)
    const user = await fillForm()

    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Password updated successfully')
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'))
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('disables button and shows "Updating…" while in flight', async () => {
    let resolve: (v: unknown) => void
    mockSignInWithPassword.mockReturnValueOnce(new Promise(r => { resolve = r }))
    render(<ChangePasswordPage />)
    const user = await fillForm()

    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(screen.getByRole('button', { name: 'Updating…' })).toBeDisabled()
    resolve!({ error: null })
  })

  it('error element has role="alert"', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid' } })
    render(<ChangePasswordPage />)
    const user = await fillForm()

    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('success element has role="status"', async () => {
    render(<ChangePasswordPage />)
    const user = await fillForm()

    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByRole('status')).toBeInTheDocument()
  })

  it('shows generic error and re-enables button when unexpected exception is thrown', async () => {
    mockSignInWithPassword.mockRejectedValueOnce(new Error('Network failure'))
    render(<ChangePasswordPage />)
    const user = await fillForm()

    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update password' })).not.toBeDisabled()
  })

  it('disables the button while user email is still loading', () => {
    mockGetUser.mockReturnValueOnce(new Promise(() => {}))
    render(<ChangePasswordPage />)
    expect(screen.getByRole('button', { name: 'Update password' })).toBeDisabled()
  })

  it('resets loading to false after a successful password change', async () => {
    render(<ChangePasswordPage />)
    const user = await fillForm()

    await user.click(screen.getByRole('button', { name: 'Update password' }))

    await screen.findByRole('status')
    expect(screen.getByRole('button', { name: 'Update password' })).toBeDisabled()
  })

  it('new password input has minLength of 6', () => {
    render(<ChangePasswordPage />)
    expect(screen.getByLabelText('New password')).toHaveAttribute('minLength', '6')
  })

  it('confirm password input has minLength of 6', () => {
    render(<ChangePasswordPage />)
    expect(screen.getByLabelText('Confirm new password')).toHaveAttribute('minLength', '6')
  })

  it('shows error when form is submitted while userEmail is null', async () => {
    mockGetUser.mockReturnValueOnce(new Promise(() => {})) // never resolves
    render(<ChangePasswordPage />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('New password'), 'newpass123')
    await user.type(screen.getByLabelText('Confirm new password'), 'newpass123')

    const form = screen.getByRole('button', { name: 'Update password' }).closest('form')!
    fireEvent.submit(form)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to verify your account. Please sign in again.'
    )
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('shows success and suppresses error when router.push throws synchronously', async () => {
    mockPush.mockImplementationOnce(() => { throw new Error('Navigation blocked') })
    render(<ChangePasswordPage />)
    const user = await fillForm()

    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
