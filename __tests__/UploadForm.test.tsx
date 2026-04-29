import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadForm from '@/app/dashboard/docs/UploadForm'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: () => [false, (fn: () => void) => fn()],
}))

function makeFile(name = 'warranty.pdf', type = 'application/pdf', size = 1024) {
  return new File(['x'.repeat(size)], name, { type })
}

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
})

describe('UploadForm', () => {
  it('renders plan name input, file picker, and a disabled Upload button', () => {
    render(<UploadForm />)
    expect(screen.getByPlaceholderText(/Premium Home Warranty/)).toBeInTheDocument()
    expect(screen.getByLabelText(/PDF file/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled()
  })

  it('Upload button stays disabled until both plan name and file are provided', async () => {
    const user = userEvent.setup()
    render(<UploadForm />)

    await user.type(screen.getByPlaceholderText(/Premium Home Warranty/), 'My Plan')
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled()

    await user.upload(screen.getByLabelText(/PDF file/), makeFile())
    expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled()
  })

  it('calls the API with plan_name and file in FormData on click', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ chunksInserted: 3 }),
    })
    const user = userEvent.setup()
    render(<UploadForm />)

    await user.type(screen.getByPlaceholderText(/Premium Home Warranty/), 'Gold Plan')
    await user.upload(screen.getByLabelText(/PDF file/), makeFile())
    await user.click(screen.getByRole('button', { name: 'Upload' }))

    expect(global.fetch).toHaveBeenCalledWith('/api/warranty-upload', expect.objectContaining({ method: 'POST' }))
    const body: FormData = (global.fetch as jest.Mock).mock.calls[0][1].body
    expect(body.get('plan_name')).toBe('Gold Plan')
    expect(body.get('file')).toBeInstanceOf(File)
  })

  it('shows success message and clears inputs after upload', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ chunksInserted: 5 }),
    })
    const user = userEvent.setup()
    render(<UploadForm />)

    await user.type(screen.getByPlaceholderText(/Premium Home Warranty/), 'Gold Plan')
    await user.upload(screen.getByLabelText(/PDF file/), makeFile())
    await user.click(screen.getByRole('button', { name: 'Upload' }))

    expect(await screen.findByText(/Uploaded 5 chunks for "Gold Plan"/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Premium Home Warranty/)).toHaveValue('')
  })

  it('shows error message when the API returns an error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Only PDF files are accepted' }),
    })
    const user = userEvent.setup()
    render(<UploadForm />)

    await user.type(screen.getByPlaceholderText(/Premium Home Warranty/), 'Gold Plan')
    await user.upload(screen.getByLabelText(/PDF file/), makeFile())
    await user.click(screen.getByRole('button', { name: 'Upload' }))

    expect(await screen.findByText('Only PDF files are accepted')).toBeInTheDocument()
  })

  it('disables the button and shows Uploading… for the full fetch round-trip', async () => {
    let resolveFetch: (v: Response) => void
    ;(global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise(r => { resolveFetch = r as (v: Response) => void })
    )
    const user = userEvent.setup()
    render(<UploadForm />)

    await user.type(screen.getByPlaceholderText(/Premium Home Warranty/), 'Gold Plan')
    await user.upload(screen.getByLabelText(/PDF file/), makeFile())
    await user.click(screen.getByRole('button', { name: 'Upload' }))

    expect(screen.getByRole('button', { name: 'Uploading…' })).toBeDisabled()
    expect(global.fetch).toHaveBeenCalledTimes(1)

    resolveFetch!({ ok: true, json: async () => ({ chunksInserted: 2 }) } as Response)
  })

  it('ignores a second click while an upload is already in flight', async () => {
    let resolveFetch: (v: Response) => void
    ;(global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise(r => { resolveFetch = r as (v: Response) => void })
    )
    const user = userEvent.setup()
    render(<UploadForm />)

    await user.type(screen.getByPlaceholderText(/Premium Home Warranty/), 'Gold Plan')
    await user.upload(screen.getByLabelText(/PDF file/), makeFile())
    await user.click(screen.getByRole('button', { name: 'Upload' }))
    await user.click(screen.getByRole('button', { name: 'Uploading…' }))

    expect(global.fetch).toHaveBeenCalledTimes(1)

    resolveFetch!({ ok: true, json: async () => ({ chunksInserted: 2 }) } as Response)
  })
})
