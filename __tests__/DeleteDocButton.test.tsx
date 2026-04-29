import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteDocButton from '@/app/dashboard/docs/DeleteDocButton'

beforeEach(() => {
  jest.clearAllMocks()
  window.confirm = jest.fn()
})

describe('DeleteDocButton', () => {
  it('renders the Delete button', () => {
    render(<DeleteDocButton action={jest.fn()} planName="Plan A" />)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('shows confirm dialog containing the plan name when clicked', async () => {
    const user = userEvent.setup()
    ;(window.confirm as jest.Mock).mockReturnValue(false)
    render(<DeleteDocButton action={jest.fn()} planName="Premium Plan" />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Premium Plan'))
  })

  it('does not call action when confirm is cancelled', async () => {
    const user = userEvent.setup()
    ;(window.confirm as jest.Mock).mockReturnValue(false)
    const action = jest.fn()
    render(<DeleteDocButton action={action} planName="Plan A" />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(action).not.toHaveBeenCalled()
  })

  it('calls action when confirm is accepted', async () => {
    const user = userEvent.setup()
    ;(window.confirm as jest.Mock).mockReturnValue(true)
    const action = jest.fn().mockResolvedValue(undefined)
    render(<DeleteDocButton action={action} planName="Plan A" />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1))
  })

  it('shows Deleting… and disables button while action is in flight', async () => {
    const user = userEvent.setup()
    ;(window.confirm as jest.Mock).mockReturnValue(true)
    let resolve: () => void
    const action = jest.fn().mockReturnValue(new Promise<void>(r => { resolve = r }))
    render(<DeleteDocButton action={action} planName="Plan A" />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('button', { name: 'Deleting…' })).toBeDisabled()
    resolve!()
  })

  it('shows error message and re-enables button when action throws', async () => {
    const user = userEvent.setup()
    ;(window.confirm as jest.Mock).mockReturnValue(true)
    const action = jest.fn().mockRejectedValue(new Error('Server error'))
    render(<DeleteDocButton action={action} planName="Plan A" />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByText('Failed to delete. Please try again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).not.toBeDisabled()
  })

  it('ignores a second click while action is in flight', async () => {
    const user = userEvent.setup()
    ;(window.confirm as jest.Mock).mockReturnValue(true)
    let resolve: () => void
    const action = jest.fn().mockReturnValue(new Promise<void>(r => { resolve = r }))
    render(<DeleteDocButton action={action} planName="Plan A" />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    // Button is now "Deleting…" and disabled — click must be a no-op
    await user.click(screen.getByRole('button', { name: 'Deleting…' }))
    expect(action).toHaveBeenCalledTimes(1)
    resolve!()
  })
})
