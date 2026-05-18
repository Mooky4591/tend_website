import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RemindersPanel from '@/app/dashboard/homeowners/[id]/RemindersPanel'

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
  { id: 'rem-1', reminder_type: 'hvac_filter', due_date: '2026-06-01', sent: false, skipped_at: null },
  { id: 'rem-2', reminder_type: 'hvac_service', due_date: '2026-09-01', sent: true, skipped_at: null },
]

describe('RemindersPanel', () => {
  it('renders each reminder with type and formatted date', () => {
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)
    expect(screen.getByText('hvac_filter')).toBeInTheDocument()
    expect(screen.getByText('hvac_service')).toBeInTheDocument()
    expect(screen.getByText('Sent')).toBeInTheDocument()
  })

  it('shows empty state when there are no reminders', () => {
    render(<RemindersPanel reminders={[]} userId="u1" remindersPaused={false} />)
    expect(screen.getByText('No reminders scheduled')).toBeInTheDocument()
  })

  it('clicking Edit shows an editable form pre-filled with current values', async () => {
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

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
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

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
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('Delete calls DELETE endpoint and refreshes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0])

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/reminders/rem-1', { method: 'DELETE' })
    )
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('clicking + Add shows the new-reminder form', async () => {
    const user = userEvent.setup()
    render(<RemindersPanel reminders={[]} userId="u1" remindersPaused={false} />)

    await user.click(screen.getByRole('button', { name: '+ Add' }))

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('Add calls POST /api/reminders with userId, type, date and refreshes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ id: 'new-rem' }) })
    const user = userEvent.setup()
    const { container } = render(<RemindersPanel reminders={[]} userId="user-123" remindersPaused={false} />)

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
    render(<RemindersPanel reminders={[]} userId="u1" remindersPaused={false} />)

    await user.click(screen.getByRole('button', { name: '+ Add' }))
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Due date is required')).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('ignores a second Delete click while the first is in flight', async () => {
    let resolveFetch: (v: Response) => void
    ;(global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise(r => { resolveFetch = r as (v: Response) => void })
    )
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    // All action buttons are now disabled — second click must be a no-op
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[1])

    expect(global.fetch).toHaveBeenCalledTimes(1)

    resolveFetch!({ ok: true, json: async () => ({ ok: true }) } as Response)
  })

  it('ignores a second Save click while the first is in flight', async () => {
    let resolveFetch: (v: Response) => void
    ;(global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise(r => { resolveFetch = r as (v: Response) => void })
    )
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    await user.click(screen.getByRole('button', { name: 'Save' }))
    // Save is now disabled — second click must be a no-op
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(global.fetch).toHaveBeenCalledTimes(1)

    resolveFetch!({ ok: true, json: async () => ({}) } as Response)
  })

  it('ignores a second Add click while the first is in flight', async () => {
    let resolveFetch: (v: Response) => void
    ;(global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise(r => { resolveFetch = r as (v: Response) => void })
    )
    const user = userEvent.setup()
    const { container } = render(<RemindersPanel reminders={[]} userId="u1" remindersPaused={false} />)

    await user.click(screen.getByRole('button', { name: '+ Add' }))
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement
    await user.type(dateInput, '2026-08-01')

    await user.click(screen.getByRole('button', { name: 'Add' }))
    // Add is now disabled — second click must be a no-op
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(global.fetch).toHaveBeenCalledTimes(1)

    resolveFetch!({ ok: true, json: async () => ({ id: 'new' }) } as Response)
  })

  it('shows error and does not refresh when Delete request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false })
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0])

    expect(await screen.findByText('Failed to delete')).toBeInTheDocument()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('shows error and does not refresh when Save request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false })
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Failed to save')).toBeInTheDocument()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('scrolls the add form into view when + Add is clicked (so it is not hidden below the internal scroll region)', async () => {
    const scrollSpy = jest.fn()
    const originalScroll = (Element.prototype as unknown as { scrollIntoView?: typeof scrollSpy }).scrollIntoView
    ;(Element.prototype as unknown as { scrollIntoView: typeof scrollSpy }).scrollIntoView = scrollSpy
    try {
      const user = userEvent.setup()
      render(<RemindersPanel reminders={[]} userId="u1" remindersPaused={false} />)

      await user.click(screen.getByRole('button', { name: '+ Add' }))

      expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest' })
    } finally {
      if (originalScroll === undefined) {
        delete (Element.prototype as unknown as { scrollIntoView?: typeof scrollSpy }).scrollIntoView
      } else {
        ;(Element.prototype as unknown as { scrollIntoView: typeof scrollSpy }).scrollIntoView = originalScroll
      }
    }
  })

  it('scrolls the editing card into view when Edit is clicked', async () => {
    const scrollSpy = jest.fn()
    const originalScroll = (Element.prototype as unknown as { scrollIntoView?: typeof scrollSpy }).scrollIntoView
    ;(Element.prototype as unknown as { scrollIntoView: typeof scrollSpy }).scrollIntoView = scrollSpy
    try {
      const user = userEvent.setup()
      render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

      await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])

      expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest' })
    } finally {
      if (originalScroll === undefined) {
        delete (Element.prototype as unknown as { scrollIntoView?: typeof scrollSpy }).scrollIntoView
      } else {
        ;(Element.prototype as unknown as { scrollIntoView: typeof scrollSpy }).scrollIntoView = originalScroll
      }
    }
  })

  it('changing the reminder type in the edit form updates the select value', async () => {
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    const select = screen.getByRole('combobox') as HTMLSelectElement
    await user.selectOptions(select, 'hvac_service')
    expect(select.value).toBe('hvac_service')
  })

  it('changing the reminder type in the add form updates the select value', async () => {
    const user = userEvent.setup()
    render(<RemindersPanel reminders={[]} userId="u1" remindersPaused={false} />)

    await user.click(screen.getByRole('button', { name: '+ Add' }))
    const select = screen.getByRole('combobox') as HTMLSelectElement
    await user.selectOptions(select, 'hvac_service')
    expect(select.value).toBe('hvac_service')
  })

  it('clicking Cancel in the add form closes it and clears any prior error', async () => {
    const user = userEvent.setup()
    render(<RemindersPanel reminders={[]} userId="u1" remindersPaused={false} />)

    // Trigger an error so we can verify Cancel clears it
    await user.click(screen.getByRole('button', { name: '+ Add' }))
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Due date is required')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    expect(screen.queryByText('Due date is required')).not.toBeInTheDocument()
  })

  it('shows error and does not refresh when Add request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false })
    const user = userEvent.setup()
    const { container } = render(<RemindersPanel reminders={[]} userId="u1" remindersPaused={false} />)

    await user.click(screen.getByRole('button', { name: '+ Add' }))
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement
    await user.type(dateInput, '2026-08-01')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Failed to add reminder')).toBeInTheDocument()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('renders "Pause" when reminders are not paused', () => {
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Unpause' })).not.toBeInTheDocument()
    expect(screen.queryByText('Paused')).not.toBeInTheDocument()
  })

  it('renders "Unpause" and the Paused pill when reminders are paused', () => {
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={true} />)
    expect(screen.getByRole('button', { name: 'Unpause' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
    expect(screen.getByText('Paused')).toBeInTheDocument()
  })

  it('reminder cards have the greyed-out class when paused', () => {
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={true} />)
    const cards = screen.getAllByTestId('reminder-card')
    expect(cards).toHaveLength(REMINDERS.length)
    for (const card of cards) {
      expect(card.className).toContain('opacity-60')
    }
  })

  it('reminder cards do not have the greyed-out class when not paused', () => {
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)
    const cards = screen.getAllByTestId('reminder-card')
    for (const card of cards) {
      expect(card.className).not.toContain('opacity-60')
    }
  })

  it('clicking Pause PATCHes the route with paused:true, flips the label, and refreshes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) })
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

    await user.click(screen.getByRole('button', { name: 'Pause' }))

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/users/u1/reminders-pause', expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"paused":true'),
      }))
    )
    expect(await screen.findByRole('button', { name: 'Unpause' })).toBeInTheDocument()
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('clicking Unpause PATCHes the route with paused:false, flips the label, and refreshes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) })
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={true} />)

    await user.click(screen.getByRole('button', { name: 'Unpause' }))

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/users/u1/reminders-pause', expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"paused":false'),
      }))
    )
    expect(await screen.findByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('shows error and does not flip the label when pause request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false })
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

    await user.click(screen.getByRole('button', { name: 'Pause' }))

    expect(await screen.findByText('Failed to update pause state')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('ignores a second Pause click while the first is in flight', async () => {
    let resolveFetch: (v: Response) => void
    ;(global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise(r => { resolveFetch = r as (v: Response) => void })
    )
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)

    await user.click(screen.getByRole('button', { name: 'Pause' }))
    await user.click(screen.getByRole('button', { name: 'Pause' }))

    expect(global.fetch).toHaveBeenCalledTimes(1)

    resolveFetch!({ ok: true, json: async () => ({}) } as Response)
  })

  it('resyncs the toggle when the remindersPaused prop changes', () => {
    const { rerender } = render(
      <RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />
    )
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.queryByText('Paused')).not.toBeInTheDocument()

    rerender(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={true} />)
    expect(screen.getByRole('button', { name: 'Unpause' })).toBeInTheDocument()
    expect(screen.getByText('Paused')).toBeInTheDocument()

    rerender(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={false} />)
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.queryByText('Paused')).not.toBeInTheDocument()
  })

  it('resyncs the toggle when the userId prop changes (different homeowner reusing the instance)', () => {
    const { rerender } = render(
      <RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={true} />
    )
    expect(screen.getByRole('button', { name: 'Unpause' })).toBeInTheDocument()

    rerender(<RemindersPanel reminders={REMINDERS} userId="u2" remindersPaused={false} />)
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })

  it('Edit still opens the inline form while paused', async () => {
    const user = userEvent.setup()
    render(<RemindersPanel reminders={REMINDERS} userId="u1" remindersPaused={true} />)

    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-06-01')).toBeInTheDocument()
  })
})
