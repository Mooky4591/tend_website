import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignOutButton from '@/app/dashboard/SignOutButton'

const mockSignOut = jest.fn()
const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signOut: mockSignOut },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockSignOut.mockResolvedValue({ error: null })
})

describe('SignOutButton', () => {
  it('renders a sign out button', () => {
    render(<SignOutButton />)
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('calls signOut and redirects to /login on success', async () => {
    const user = userEvent.setup()
    render(<SignOutButton />)

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/login')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('shows an error message and does not redirect when signOut fails', async () => {
    mockSignOut.mockResolvedValueOnce({ error: { message: 'Network error' } })
    const user = userEvent.setup()
    render(<SignOutButton />)

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(await screen.findByText('Sign out failed. Please try again.')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('disables the button and shows "Signing out…" while the request is in flight', async () => {
    let resolve: (v: unknown) => void
    mockSignOut.mockReturnValueOnce(new Promise(r => { resolve = r }))
    const user = userEvent.setup()
    render(<SignOutButton />)

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(screen.getByRole('button', { name: 'Signing out…' })).toBeDisabled()
    resolve!({ error: null })
  })

  it('re-enables the button after a failed sign-out', async () => {
    mockSignOut.mockResolvedValueOnce({ error: { message: 'Network error' } })
    const user = userEvent.setup()
    render(<SignOutButton />)

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign out' })).not.toBeDisabled())
  })

  it('error message has role="alert" so screen readers announce it', async () => {
    mockSignOut.mockResolvedValueOnce({ error: { message: 'Network error' } })
    const user = userEvent.setup()
    render(<SignOutButton />)

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Sign out failed. Please try again.')
  })
})
