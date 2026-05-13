/**
 * @jest-environment node
 */

import { POST } from '@/app/api/warranty-upload/route'
import { NextRequest } from 'next/server'
import { extractAndChunk } from '@/lib/pdf'
import { embedChunks } from '@/lib/embed'

const mockGetUser = jest.fn()
const mockTenantSingle = jest.fn()
const mockDocSelectEq = jest.fn()
const mockDocInsert = jest.fn()
const mockDocDeleteIn = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => {
      if (table === 'tenant_users') {
        return { select: () => ({ eq: () => ({ single: mockTenantSingle }) }) }
      }
      if (table === 'warranty_documents') {
        return {
          select: () => ({ eq: () => ({ eq: mockDocSelectEq }) }),
          insert: mockDocInsert,
          delete: () => ({ in: mockDocDeleteIn }),
        }
      }
    },
  }),
}))

jest.mock('@/lib/pdf', () => ({ extractAndChunk: jest.fn() }))
jest.mock('@/lib/embed', () => ({ embedChunks: jest.fn() }))

const mockExtractAndChunk = extractAndChunk as jest.Mock
const mockEmbedChunks = embedChunks as jest.Mock

function makeRequest(planName?: string, fileSize = 1024) {
  const req = new NextRequest('http://localhost/api/warranty-upload', { method: 'POST' })
  const mockFile = {
    size: fileSize,
    type: 'application/pdf',
    arrayBuffer: jest.fn().mockResolvedValue(Buffer.from('pdf content').buffer),
  }
  const fd = {
    get: (key: string) => {
      if (key === 'plan_name') return planName ?? null
      if (key === 'file') return planName !== undefined ? mockFile : null
      return null
    },
  }
  jest.spyOn(req, 'formData').mockResolvedValue(fd as unknown as FormData)
  return req
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  mockTenantSingle.mockResolvedValue({ data: { tenant_id: 'tenant-1' } })
  mockDocSelectEq.mockResolvedValue({ data: [] })
  mockDocInsert.mockResolvedValue({ error: null })
  mockDocDeleteIn.mockResolvedValue({})
  mockExtractAndChunk.mockResolvedValue(['chunk one', 'chunk two'])
  mockEmbedChunks.mockResolvedValue([[0.1, 0.2], [0.3, 0.4]])
})

describe('POST /api/warranty-upload', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const res = await POST(makeRequest('Plan A'))
    expect(res.status).toBe(401)
  })

  it('returns 403 when user has no tenant', async () => {
    mockTenantSingle.mockResolvedValueOnce({ data: null })
    const res = await POST(makeRequest('Plan A'))
    expect(res.status).toBe(403)
  })

  it('returns 400 when plan_name is missing', async () => {
    const req = new NextRequest('http://localhost/api/warranty-upload', { method: 'POST' })
    jest.spyOn(req, 'formData').mockResolvedValue({
      get: (key: string) => (key === 'file' ? { size: 100, type: 'application/pdf', arrayBuffer: jest.fn() } : null),
    } as unknown as FormData)
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when file is missing', async () => {
    const req = new NextRequest('http://localhost/api/warranty-upload', { method: 'POST' })
    jest.spyOn(req, 'formData').mockResolvedValue({
      get: (key: string) => (key === 'plan_name' ? 'Plan A' : null),
    } as unknown as FormData)
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 413 when file exceeds 10 MB', async () => {
    const res = await POST(makeRequest('Plan A', 11 * 1024 * 1024))
    expect(res.status).toBe(413)
  })

  it('returns 422 when no text is extracted from the PDF', async () => {
    mockExtractAndChunk.mockResolvedValueOnce([])
    const res = await POST(makeRequest('Plan A'))
    expect(res.status).toBe(422)
  })

  it('inserts new chunks with correct fields including chunk_index', async () => {
    await POST(makeRequest('Premium Plan'))
    expect(mockDocInsert).toHaveBeenCalledWith([
      { tenant_id: 'tenant-1', plan_name: 'Premium Plan', chunk_index: 0, content: 'chunk one', embedding: [0.1, 0.2] },
      { tenant_id: 'tenant-1', plan_name: 'Premium Plan', chunk_index: 1, content: 'chunk two', embedding: [0.3, 0.4] },
    ])
  })

  it('returns chunksInserted count on success', async () => {
    const res = await POST(makeRequest('Plan A'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.chunksInserted).toBe(2)
  })

  it('atomic swap: inserts new chunks before deleting old ones', async () => {
    mockDocSelectEq.mockResolvedValueOnce({ data: [{ id: 'old-chunk-1' }, { id: 'old-chunk-2' }] })
    const callOrder: string[] = []
    mockDocInsert.mockImplementation(() => { callOrder.push('insert'); return { error: null } })
    mockDocDeleteIn.mockImplementation(() => { callOrder.push('delete'); return {} })

    await POST(makeRequest('Plan A'))

    expect(callOrder).toEqual(['insert', 'delete'])
    expect(mockDocDeleteIn).toHaveBeenCalledWith('id', ['old-chunk-1', 'old-chunk-2'])
  })

  it('does not call delete when there are no existing chunks', async () => {
    mockDocSelectEq.mockResolvedValueOnce({ data: [] })
    await POST(makeRequest('Brand New Plan'))
    expect(mockDocDeleteIn).not.toHaveBeenCalled()
  })

  it('treats null existing data as no prior chunks and skips delete', async () => {
    mockDocSelectEq.mockResolvedValueOnce({ data: null })
    const res = await POST(makeRequest('Plan A'))
    expect(res.status).toBe(200)
    expect(mockDocDeleteIn).not.toHaveBeenCalled()
  })

  it('returns 415 when file is not a PDF', async () => {
    const req = new NextRequest('http://localhost/api/warranty-upload', { method: 'POST' })
    const mockFile = { size: 100, type: 'text/html', arrayBuffer: jest.fn() }
    jest.spyOn(req, 'formData').mockResolvedValue({
      get: (key: string) => key === 'plan_name' ? 'Plan A' : mockFile,
    } as unknown as FormData)
    const res = await POST(req)
    expect(res.status).toBe(415)
  })

  it('returns 502 when embedChunks throws', async () => {
    mockEmbedChunks.mockRejectedValueOnce(new Error('OpenAI unavailable'))
    const res = await POST(makeRequest('Plan A'))
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).toContain('embeddings')
  })

  it('returns 500 when insert fails', async () => {
    mockDocInsert.mockResolvedValueOnce({ error: { message: 'DB error' } })
    const res = await POST(makeRequest('Plan A'))
    expect(res.status).toBe(500)
  })

  it('returns 500 when old-chunk delete fails after insert succeeds', async () => {
    mockDocSelectEq.mockResolvedValueOnce({ data: [{ id: 'old-1' }] })
    mockDocDeleteIn.mockResolvedValueOnce({ error: { message: 'delete failed' } })
    const res = await POST(makeRequest('Plan A'))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('Chunks inserted but old chunks could not be removed')
  })
})
