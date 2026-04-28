import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResetPasswordPage from '@/app/reset-password/page'

const mockUpdateUser = jest.fn()
const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { updateUser: mockUpdateUser },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ResetPasswordPage', () => {
  it('renders the password field and submit button', () => {
    render(<ResetPasswordPage />)
    expect(screen.getByLabelText('New password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update password' })).toBeInTheDocument()
  })

  it('redirects to /login on success', async () => {
    mockUpdateUser.mockResolvedValueOnce({ error: null })
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('New password'), 'newpassword123')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'))
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('shows the Supabase error message when updateUser fails', async () => {
    mockUpdateUser.mockResolvedValueOnce({ error: { message: 'Password should be at least 6 characters.' } })
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('New password'), 'abc')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByText('Password should be at least 6 characters.')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('error container has role="alert"', async () => {
    mockUpdateUser.mockResolvedValueOnce({ error: { message: 'Something went wrong.' } })
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('New password'), 'newpassword123')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong.')
  })

  it('shows a generic error and re-enables button when updateUser throws', async () => {
    mockUpdateUser.mockRejectedValueOnce(new Error('Network failure'))
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('New password'), 'newpassword123')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update password' })).not.toBeDisabled()
  })

  it('disables the button and shows "Updating…" while in flight', async () => {
    let resolve: (v: unknown) => void
    mockUpdateUser.mockReturnValueOnce(new Promise(r => { resolve = r }))
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('New password'), 'newpassword123')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    expect(screen.getByRole('button', { name: 'Updating…' })).toBeDisabled()
    resolve!({ error: null })
  })

  it('resets loading state if router.push throws after successful update', async () => {
    mockUpdateUser.mockResolvedValueOnce({ error: null })
    mockPush.mockImplementationOnce(() => { throw new Error('Navigation failed') })
    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText('New password'), 'newpassword123')
    await user.click(screen.getByRole('button', { name: 'Update password' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Update password' })).not.toBeDisabled())
  })
})
