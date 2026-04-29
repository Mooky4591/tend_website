/**
 * @jest-environment node
 */

import { embedChunks } from '@/lib/embed'
import OpenAI from 'openai'

jest.mock('openai', () => {
  const createFn = jest.fn()
  const MockOpenAI = jest.fn(() => ({ embeddings: { create: createFn } }))
  ;(MockOpenAI as any).__create = createFn
  return MockOpenAI
})

const mockCreate = (OpenAI as any).__create as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

function makeEmbeddingResponse(count: number) {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      index: i,
      embedding: [i, 0.1],
    })),
  }
}

describe('embedChunks', () => {
  it('returns an empty array for empty input', async () => {
    expect(await embedChunks([])).toEqual([])
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('calls the API once when chunks fit within a single batch', async () => {
    const chunks = Array.from({ length: 50 }, (_, i) => `chunk ${i}`)
    mockCreate.mockResolvedValueOnce(makeEmbeddingResponse(50))

    const result = await embedChunks(chunks)

    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'text-embedding-3-small',
      input: chunks,
    })
    expect(result).toHaveLength(50)
  })

  it('splits into multiple batches of 100 when input exceeds batch size', async () => {
    const chunks = Array.from({ length: 250 }, (_, i) => `chunk ${i}`)
    mockCreate
      .mockResolvedValueOnce(makeEmbeddingResponse(100))
      .mockResolvedValueOnce(makeEmbeddingResponse(100))
      .mockResolvedValueOnce(makeEmbeddingResponse(50))

    const result = await embedChunks(chunks)

    expect(mockCreate).toHaveBeenCalledTimes(3)
    expect(mockCreate).toHaveBeenNthCalledWith(1, expect.objectContaining({ input: chunks.slice(0, 100) }))
    expect(mockCreate).toHaveBeenNthCalledWith(2, expect.objectContaining({ input: chunks.slice(100, 200) }))
    expect(mockCreate).toHaveBeenNthCalledWith(3, expect.objectContaining({ input: chunks.slice(200, 250) }))
    expect(result).toHaveLength(250)
  })

  it('preserves order within each batch by sorting on index', async () => {
    const chunks = ['a', 'b', 'c']
    // Return in reverse index order to confirm sort is applied
    mockCreate.mockResolvedValueOnce({
      data: [
        { index: 2, embedding: [0.3] },
        { index: 0, embedding: [0.1] },
        { index: 1, embedding: [0.2] },
      ],
    })

    const result = await embedChunks(chunks)

    expect(result).toEqual([[0.1], [0.2], [0.3]])
  })

  it('concatenates results from multiple batches in order', async () => {
    const chunks = Array.from({ length: 150 }, (_, i) => `chunk ${i}`)
    mockCreate
      .mockResolvedValueOnce({ data: Array.from({ length: 100 }, (_, i) => ({ index: i, embedding: [i] })) })
      .mockResolvedValueOnce({ data: Array.from({ length: 50 }, (_, i) => ({ index: i, embedding: [100 + i] })) })

    const result = await embedChunks(chunks)

    expect(result[0]).toEqual([0])
    expect(result[99]).toEqual([99])
    expect(result[100]).toEqual([100])
    expect(result[149]).toEqual([149])
  })

  it('uses text-embedding-3-small as the model', async () => {
    mockCreate.mockResolvedValueOnce(makeEmbeddingResponse(1))
    await embedChunks(['test'])
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: 'text-embedding-3-small' }))
  })
})
