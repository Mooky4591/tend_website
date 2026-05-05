/**
 * @jest-environment node
 */

import { uploadWarrantyDoc } from '@/lib/services/warrantyDocs'
import { extractAndChunk } from '@/lib/pdf'
import { embedChunks } from '@/lib/embed'

jest.mock('@/lib/pdf', () => ({ extractAndChunk: jest.fn() }))
jest.mock('@/lib/embed', () => ({ embedChunks: jest.fn() }))

const mockExtractAndChunk = extractAndChunk as jest.Mock
const mockEmbedChunks = embedChunks as jest.Mock

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeSupabase({
  existing = [] as { id: string }[],
  insertError = null as { message: string } | null,
  deleteError = null as { message: string } | null,
} = {}) {
  const mockInsert = jest.fn().mockResolvedValue({ error: insertError })
  const mockDeleteIn = jest.fn().mockResolvedValue({ error: deleteError })
  return {
    from: () => ({
      select: () => ({ eq: () => ({ eq: jest.fn().mockResolvedValue({ data: existing }) }) }),
      insert: mockInsert,
      delete: () => ({ in: mockDeleteIn }),
    }),
    _mockInsert: mockInsert,
    _mockDeleteIn: mockDeleteIn,
  } as any // eslint-disable-line @typescript-eslint/no-explicit-any
}

beforeEach(() => {
  jest.clearAllMocks()
  mockExtractAndChunk.mockResolvedValue(['chunk one', 'chunk two'])
  mockEmbedChunks.mockResolvedValue([[0.1, 0.2], [0.3, 0.4]])
})

describe('uploadWarrantyDoc service', () => {
  it('returns { chunksInserted: N } on success', async () => {
    expect(await uploadWarrantyDoc(makeSupabase(), 'tenant-1', 'Plan A', Buffer.from('pdf'))).toEqual({ chunksInserted: 2 })
  })

  it('returns status 422 when no text is extracted', async () => {
    mockExtractAndChunk.mockResolvedValueOnce([])
    const result = await uploadWarrantyDoc(makeSupabase(), 'tenant-1', 'Plan A', Buffer.from('pdf'))
    expect(result).toMatchObject({ status: 422 })
  })

  it('returns status 502 when embedChunks throws', async () => {
    mockEmbedChunks.mockRejectedValueOnce(new Error('OpenAI down'))
    const result = await uploadWarrantyDoc(makeSupabase(), 'tenant-1', 'Plan A', Buffer.from('pdf'))
    expect(result).toMatchObject({ status: 502 })
  })

  it('inserts rows with correct tenant_id, plan_name, chunk_index, content, and embedding', async () => {
    const supabase = makeSupabase()
    await uploadWarrantyDoc(supabase, 'tenant-1', 'Plan A', Buffer.from('pdf'))
    expect(supabase._mockInsert).toHaveBeenCalledWith([
      { tenant_id: 'tenant-1', plan_name: 'Plan A', chunk_index: 0, content: 'chunk one', embedding: [0.1, 0.2] },
      { tenant_id: 'tenant-1', plan_name: 'Plan A', chunk_index: 1, content: 'chunk two', embedding: [0.3, 0.4] },
    ])
  })

  it('insert is called before delete (atomic swap order)', async () => {
    const callOrder: string[] = []
    const mockInsert = jest.fn().mockImplementation(() => { callOrder.push('insert'); return { error: null } })
    const mockDeleteIn = jest.fn().mockImplementation(() => { callOrder.push('delete'); return { error: null } })
    const supabase = {
      from: () => ({
        select: () => ({ eq: () => ({ eq: jest.fn().mockResolvedValue({ data: [{ id: 'old-1' }] }) }) }),
        insert: mockInsert,
        delete: () => ({ in: mockDeleteIn }),
      }),
    } as any // eslint-disable-line @typescript-eslint/no-explicit-any
    await uploadWarrantyDoc(supabase, 'tenant-1', 'Plan A', Buffer.from('pdf'))
    expect(callOrder).toEqual(['insert', 'delete'])
  })

  it('does not call delete when there are no existing chunks', async () => {
    const supabase = makeSupabase({ existing: [] })
    await uploadWarrantyDoc(supabase, 'tenant-1', 'New Plan', Buffer.from('pdf'))
    expect(supabase._mockDeleteIn).not.toHaveBeenCalled()
  })

  it('returns status 500 with correct message when delete fails after insert succeeds', async () => {
    const supabase = makeSupabase({ existing: [{ id: 'old-1' }], deleteError: { message: 'delete constraint' } })
    const result = await uploadWarrantyDoc(supabase, 'tenant-1', 'Plan A', Buffer.from('pdf'))
    expect(result).toMatchObject({ status: 500 })
    expect((result as any).error).toContain('Chunks inserted but old chunks could not be removed') // eslint-disable-line @typescript-eslint/no-explicit-any
  })
})
