import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RemindersPanel from '@/app/dashboard/users/[id]/RemindersPanel'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: () => [false, (fn: () => void) => fn()],
}))

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

const REMINDERS = [
  { id: 'rem-1', reminder_type: 'hvac_filter', due_date: '2026-06-01', sent: false },
  { id: 'rem-2', reminder_type: 'hvac_service', due_date: '2026-09-01', sent: true },
]

describe('RemindersPanel', () => {
  it('renders each reminder with type and formatted date', () => {
    render(<RemindersPanel reminders={REMINDERS} userId="u1" />)
    expect(screen.getByText('hvac_filter')).toBeInTheDocument()
    expect(screen.getByText('hvac_service')).toBeInTheDocument()
    expect(screen.getByText('Sent')).toBeInTheDocument()
  })

  it('shows empty state when there are no reminders', () => {
    render(<RemindersPanel reminders={[]} userId="u1" />)
    expect(screen.getByText('No reminders scheduled')).toBeInTheDocument()
  })

  it('clicking Edit shows an editable form pre-filled with current values', async () => {
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" />)

    const editButtons = screen.getAllByRole('button', { name: 'Edit' })
    await user.click(editButtons[0])

    expect(screen.getByRole('combobox')).toHaveValue('hvac_filter')
    expect(screen.getByDisplayValue('2026-06-01')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('Save calls PATCH with the updated values and refreshes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) })
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" />)

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    // Change the due date
    const dateInput = screen.getByDisplayValue('2026-06-01')
    await user.clear(dateInput)
    await user.type(dateInput, '2026-07-15')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/reminders/rem-1', expect.objectContaining({ method: 'PATCH' }))
    )
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('Cancel hides the edit form without saving', async () => {
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" />)

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('Delete calls DELETE endpoint and refreshes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" />)

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0])

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/reminders/rem-1', { method: 'DELETE' })
    )
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('clicking + Add shows the new-reminder form', async () => {
    const user = userEvent.setup()
    render(<RemindersPanel reminders={[]} userId="u1" />)

    await user.click(screen.getByRole('button', { name: '+ Add' }))

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('Add calls POST /api/reminders with userId, type, date and refreshes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ id: 'new-rem' }) })
    const user = userEvent.setup()
    const { container } = render(<RemindersPanel reminders={[]} userId="user-123" />)

    await user.click(screen.getByRole('button', { name: '+ Add' }))

    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement
    await user.type(dateInput, '2026-08-01')

    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/reminders', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"userId":"user-123"'),
      }))
    )
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('shows error when Add is clicked without a due date', async () => {
    const user = userEvent.setup()
    render(<RemindersPanel reminders={[]} userId="u1" />)

    await user.click(screen.getByRole('button', { name: '+ Add' }))
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Due date is required')).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
