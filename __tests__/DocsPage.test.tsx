import { render, screen } from '@testing-library/react'
import DocsPage from '@/app/dashboard/docs/page'

const mockRedirect = jest.fn()
const mockGetUser = jest.fn()
const mockDocsSelect = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (path: string) => { mockRedirect(path); throw new Error(`NEXT_REDIRECT:${path}`) },
}))

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({ select: mockDocsSelect }),
  }),
}))

jest.mock('@/app/dashboard/docs/UploadForm', () => {
  const UploadForm = () => <div data-testid="upload-form" />
  UploadForm.displayName = 'UploadForm'
  return UploadForm
})

jest.mock('@/app/dashboard/docs/DeleteDocButton', () => {
  const DeleteDocButton = ({ planName }: { planName: string; action: () => Promise<void> }) => (
    <button>Delete {planName}</button>
  )
  DeleteDocButton.displayName = 'DeleteDocButton'
  return DeleteDocButton
})

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  mockDocsSelect.mockResolvedValue({ data: [] })
})

describe('DocsPage', () => {
  it('redirects to /login when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(DocsPage()).rejects.toThrow('NEXT_REDIRECT:/login')
  })

  it('shows empty state when there are no documents', async () => {
    render(await DocsPage())
    expect(screen.getByText('No documents uploaded yet')).toBeInTheDocument()
  })

  it('renders each document with its plan name', async () => {
    mockDocsSelect.mockResolvedValueOnce({
      data: [
        { plan_name: 'Premium Plan', chunk_count: 42, uploaded_at: '2026-04-01T00:00:00Z' },
        { plan_name: 'Basic Plan', chunk_count: 10, uploaded_at: '2026-03-01T00:00:00Z' },
      ],
    })
    render(await DocsPage())
    expect(screen.getByText('Premium Plan')).toBeInTheDocument()
    expect(screen.getByText('Basic Plan')).toBeInTheDocument()
  })

  it('displays chunk count for each document', async () => {
    mockDocsSelect.mockResolvedValueOnce({
      data: [{ plan_name: 'Plan A', chunk_count: 87, uploaded_at: '2026-04-01T00:00:00Z' }],
    })
    render(await DocsPage())
    expect(screen.getByText(/87 chunks/)).toBeInTheDocument()
  })

  it('renders documents sorted most-recent first', async () => {
    mockDocsSelect.mockResolvedValueOnce({
      data: [
        { plan_name: 'Older Plan', chunk_count: 5, uploaded_at: '2026-02-01T00:00:00Z' },
        { plan_name: 'Newer Plan', chunk_count: 8, uploaded_at: '2026-04-01T00:00:00Z' },
      ],
    })
    render(await DocsPage())
    const body = document.body.textContent ?? ''
    expect(body.indexOf('Newer Plan')).toBeLessThan(body.indexOf('Older Plan'))
  })

  it('renders the UploadForm', async () => {
    render(await DocsPage())
    expect(screen.getByTestId('upload-form')).toBeInTheDocument()
  })

  it('renders a Delete button for each document', async () => {
    mockDocsSelect.mockResolvedValueOnce({
      data: [
        { plan_name: 'Plan A', chunk_count: 5, uploaded_at: '2026-04-01T00:00:00Z' },
        { plan_name: 'Plan B', chunk_count: 3, uploaded_at: '2026-03-01T00:00:00Z' },
      ],
    })
    render(await DocsPage())
    expect(screen.getByText('Delete Plan A')).toBeInTheDocument()
    expect(screen.getByText('Delete Plan B')).toBeInTheDocument()
  })

  it('handles null data response without crashing', async () => {
    mockDocsSelect.mockResolvedValueOnce({ data: null })
    render(await DocsPage())
    expect(screen.getByText('No documents uploaded yet')).toBeInTheDocument()
  })
})
