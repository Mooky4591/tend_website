/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'

// ─── Supabase mock ────────────────────────────────────────────────────────────

const mockConvoRange  = jest.fn()
const mockConvoOrder  = jest.fn()
const mockConvoGte    = jest.fn()
const mockConvoSelect = jest.fn()

const mockUserIn      = jest.fn()
const mockUserSelect  = jest.fn()

const mockFrom = jest.fn()

jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(() => ({ from: mockFrom })),
}))

function resetMocks() {
  mockConvoRange.mockResolvedValue({ data: [] })
  mockConvoOrder.mockReturnValue({ range: mockConvoRange })
  mockConvoGte.mockReturnValue({ order: mockConvoOrder })
  mockConvoSelect.mockReturnValue({ gte: mockConvoGte })

  mockUserIn.mockResolvedValue({ data: [] })
  mockUserSelect.mockReturnValue({ in: mockUserIn })

  mockFrom.mockImplementation((table: string) => {
    if (table === 'conversations') return { select: mockConvoSelect }
    if (table === 'users')         return { select: mockUserSelect }
    return {}
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ConversationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetMocks()
  })

  it('shows "No conversations" when there are no recent conversations', async () => {
    const { default: ConversationsPage } = await import('@/app/admin/conversations/page')
    render(await ConversationsPage())
    expect(screen.getByText(/no conversations in the last 7 days/i)).toBeInTheDocument()
  })

  it('renders a row per unique user with recent conversations', async () => {
    const now = new Date().toISOString()
    mockConvoRange.mockResolvedValue({
      data: [
        { user_id: 'u1', created_at: now, ai_quality_flag: false, ai_quality_reason: null, manually_flagged: false },
        { user_id: 'u2', created_at: now, ai_quality_flag: true,  ai_quality_reason: 'Issue', manually_flagged: false },
      ],
    })
    mockUserIn.mockResolvedValue({
      data: [
        { id: 'u1', first_name: 'Alice', last_name: 'Smith', phone_number: '+15550001111' },
        { id: 'u2', first_name: 'Bob',   last_name: null,    phone_number: '+15550002222' },
      ],
    })
    const { default: ConversationsPage } = await import('@/app/admin/conversations/page')
    render(await ConversationsPage())
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('truncates AI quality reason at 100 characters', async () => {
    const longReason = 'x'.repeat(150)
    const now = new Date().toISOString()
    mockConvoRange.mockResolvedValue({
      data: [
        { user_id: 'u1', created_at: now, ai_quality_flag: true, ai_quality_reason: longReason, manually_flagged: false },
      ],
    })
    mockUserIn.mockResolvedValue({
      data: [{ id: 'u1', first_name: 'Ann', last_name: null, phone_number: null }],
    })
    const { default: ConversationsPage } = await import('@/app/admin/conversations/page')
    render(await ConversationsPage())
    expect(screen.getByText('x'.repeat(100) + '…')).toBeInTheDocument()
  })

  it('deduplicates user IDs and passes them all to the users lookup', async () => {
    const now = new Date().toISOString()
    mockConvoRange.mockResolvedValue({
      data: [
        { user_id: 'u1', created_at: now, ai_quality_flag: false, ai_quality_reason: null, manually_flagged: false },
        { user_id: 'u2', created_at: now, ai_quality_flag: false, ai_quality_reason: null, manually_flagged: false },
        { user_id: 'u1', created_at: now, ai_quality_flag: false, ai_quality_reason: null, manually_flagged: false },
      ],
    })
    const { default: ConversationsPage } = await import('@/app/admin/conversations/page')
    await ConversationsPage()
    // u1 appears twice but deduplicates to 2 unique IDs in a single chunk
    expect(mockUserIn).toHaveBeenCalledTimes(1)
    const ids = (mockUserIn as jest.Mock).mock.calls[0][1] as string[]
    expect(ids).toHaveLength(2)
    expect(ids).toEqual(expect.arrayContaining(['u1', 'u2']))
  })
})
