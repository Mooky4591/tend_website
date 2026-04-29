import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageForm from '@/app/dashboard/users/[id]/MessageForm'

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

describe('MessageForm', () => {
  it('renders the textarea and a disabled send button when empty', () => {
    render(<MessageForm userId="u1" />)
    expect(screen.getByPlaceholderText(/Type a message/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('enables the send button when the textarea has content', async () => {
    const user = userEvent.setup()
    render(<MessageForm userId="u1" />)
    await user.type(screen.getByPlaceholderText(/Type a message/), 'Hello there')
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled()
  })

  it('calls the API with the correct userId and message on click', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    const user = userEvent.setup()
    render(<MessageForm userId="user-123" />)

    await user.type(screen.getByPlaceholderText(/Type a message/), 'Hi homeowner')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(global.fetch).toHaveBeenCalledWith('/api/send-message', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ userId: 'user-123', message: 'Hi homeowner' }),
    }))
  })

  it('trims whitespace before sending', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    const user = userEvent.setup()
    render(<MessageForm userId="u1" />)

    await user.type(screen.getByPlaceholderText(/Type a message/), '  Hello  ')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
    expect(body.message).toBe('Hello')
  })

  it('clears the textarea and calls router.refresh on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    const user = userEvent.setup()
    render(<MessageForm userId="u1" />)

    await user.type(screen.getByPlaceholderText(/Type a message/), 'Hello')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a message/)).toHaveValue('')
    })
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('shows an error message when the API returns an error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Twilio failure' }),
    })
    const user = userEvent.setup()
    render(<MessageForm userId="u1" />)

    await user.type(screen.getByPlaceholderText(/Type a message/), 'Hello')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('Twilio failure')).toBeInTheDocument()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('disables the button and shows Sending… for the full fetch round-trip, not just the refresh', async () => {
    let resolveFetch: (v: Response) => void
    ;(global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise(r => { resolveFetch = r as (v: Response) => void })
    )
    const user = userEvent.setup()
    render(<MessageForm userId="u1" />)

    await user.type(screen.getByPlaceholderText(/Type a message/), 'Hello')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    // Fetch is still in-flight — button must be disabled right now
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled()
    expect(global.fetch).toHaveBeenCalledTimes(1)

    // Resolve the fetch so the component can clean up
    resolveFetch!({ ok: true, json: async () => ({ ok: true }) } as Response)
  })

  it('ignores a second click while a send is already in flight', async () => {
    let resolveFetch: (v: Response) => void
    ;(global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise(r => { resolveFetch = r as (v: Response) => void })
    )
    const user = userEvent.setup()
    render(<MessageForm userId="u1" />)

    await user.type(screen.getByPlaceholderText(/Type a message/), 'Hello')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    // Second click while in-flight
    await user.click(screen.getByRole('button', { name: 'Sending…' }))

    expect(global.fetch).toHaveBeenCalledTimes(1)

    resolveFetch!({ ok: true, json: async () => ({ ok: true }) } as Response)
  })

  it('submits on Enter and does not submit on Shift+Enter', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    const user = userEvent.setup()
    render(<MessageForm userId="u1" />)
    const textarea = screen.getByPlaceholderText(/Type a message/)

    await user.type(textarea, 'Hello{Enter}')
    expect(global.fetch).toHaveBeenCalledTimes(1)

    ;(global.fetch as jest.Mock).mockClear()
    await user.type(textarea, 'Line1{Shift>}{Enter}{/Shift}still typing')
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
