import { render, screen } from '@testing-library/react'
import DocsPage from '@/app/dashboard/docs/page'

const mockRedirect = jest.fn()
const mockGetUser = jest.fn()
const mockDocsSelect = jest.fn()
const mockDeleteEq = jest.fn()
const mockRevalidatePath = jest.fn()
const mockGetTenantId = jest.fn()

// Captured actions are populated during render when DeleteDocButton mounts
const capturedDeleteActions: Record<string, () => Promise<void>> = {}

jest.mock('next/navigation', () => ({
  redirect: (path: string) => { mockRedirect(path); throw new Error(`NEXT_REDIRECT:${path}`) },
}))

jest.mock('next/cache', () => ({ revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args) }))

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'warranty_documents') {
        return {
          select: mockDocsSelect,
          delete: () => ({ eq: () => ({ eq: () => mockDeleteEq() }) }),
        }
      }
      return { select: mockDocsSelect }
    },
  }),
}))

jest.mock('@/lib/auth', () => ({
  getTenantId: (...args: unknown[]) => mockGetTenantId(...args),
}))

jest.mock('@/app/dashboard/docs/UploadForm', () => {
  const UploadForm = () => <div data-testid="upload-form" />
  UploadForm.displayName = 'UploadForm'
  return UploadForm
})

jest.mock('@/app/dashboard/docs/DeleteDocButton', () => {
  const DeleteDocButton = ({ planName, action }: { planName: string; action: () => Promise<void> }) => {
    capturedDeleteActions[planName] = action
    return <button>Delete {planName}</button>
  }
  DeleteDocButton.displayName = 'DeleteDocButton'
  return DeleteDocButton
})

beforeEach(() => {
  jest.clearAllMocks()
  Object.keys(capturedDeleteActions).forEach(k => delete capturedDeleteActions[k])
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  mockDocsSelect.mockResolvedValue({ data: [] })
  mockGetTenantId.mockResolvedValue('tenant-1')
  mockDeleteEq.mockResolvedValue({ error: null })
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

  describe('deleteDoc server action', () => {
    async function renderWithDoc() {
      mockDocsSelect.mockResolvedValueOnce({
        data: [{ plan_name: 'Plan A', chunk_count: 5, uploaded_at: '2026-04-01T00:00:00Z' }],
      })
      render(await DocsPage())
    }

    it('throws Unauthorized when user is not authenticated', async () => {
      await renderWithDoc()
      mockGetUser.mockResolvedValueOnce({ data: { user: null } })
      await expect(capturedDeleteActions['Plan A']()).rejects.toThrow('Unauthorized')
    })

    it('throws No tenant when getTenantId returns null', async () => {
      await renderWithDoc()
      mockGetTenantId.mockResolvedValueOnce(null)
      await expect(capturedDeleteActions['Plan A']()).rejects.toThrow('No tenant')
    })

    it('throws when DB delete returns an error', async () => {
      await renderWithDoc()
      mockDeleteEq.mockResolvedValueOnce({ error: { message: 'constraint violation', code: 'DB_ERR' } })
      await expect(capturedDeleteActions['Plan A']()).rejects.toMatchObject({ message: 'constraint violation' })
    })

    it('calls revalidatePath on successful delete', async () => {
      await renderWithDoc()
      await capturedDeleteActions['Plan A']()
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/docs')
    })
  })
})
