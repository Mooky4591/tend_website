/**
 * @jest-environment node
 */
import { chunkText, extractAndChunk, PdfParseError } from '@/lib/pdf'

const mockGetText = jest.fn()
const mockDestroy = jest.fn().mockResolvedValue(undefined)

jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn().mockImplementation(() => ({ getText: mockGetText, destroy: mockDestroy })),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

function words(n: number) {
  return Array.from({ length: n }, (_, i) => `word${i}`)
}

describe('chunkText', () => {
  it('returns empty array for empty string', () => {
    expect(chunkText('')).toEqual([])
  })

  it('returns empty array for whitespace-only string', () => {
    expect(chunkText('   \n\t  ')).toEqual([])
  })

  it('returns a single chunk when text is under 500 words', () => {
    const text = words(100).join(' ')
    expect(chunkText(text)).toHaveLength(1)
    expect(chunkText(text)[0]).toBe(text)
  })

  it('first chunk contains exactly 500 words', () => {
    const text = words(1000).join(' ')
    const chunks = chunkText(text)
    expect(chunks[0].split(' ')).toHaveLength(500)
  })

  it('produces a second chunk starting at word 450 (500 − 50 overlap)', () => {
    const w = words(600)
    const chunks = chunkText(w.join(' '))
    expect(chunks.length).toBeGreaterThanOrEqual(2)
    // Chunk 1 starts at index 450
    expect(chunks[1].startsWith(w[450])).toBe(true)
  })

  it('last 50 words of chunk N equal first 50 words of chunk N+1', () => {
    const w = words(600)
    const chunks = chunkText(w.join(' '))
    const endOfFirst = chunks[0].split(' ').slice(-50)
    const startOfSecond = chunks[1].split(' ').slice(0, 50)
    expect(endOfFirst).toEqual(startOfSecond)
  })

  it('normalises multiple whitespace between words', () => {
    const chunks = chunkText('a   b\n\nc   d')
    expect(chunks[0]).toBe('a b c d')
  })
})

describe('extractAndChunk', () => {
  it('returns chunked text from a valid PDF buffer', async () => {
    mockGetText.mockResolvedValue({ text: words(100).join(' ') })
    const result = await extractAndChunk(Buffer.from('fake'))
    expect(result).toHaveLength(1)
    expect(result[0].split(' ')).toHaveLength(100)
  })

  it('returns empty array when PDF has no extractable text', async () => {
    mockGetText.mockResolvedValue({ text: '' })
    const result = await extractAndChunk(Buffer.from('fake'))
    expect(result).toEqual([])
  })

  it('passes the buffer as data to PDFParse constructor', async () => {
    const { PDFParse } = require('pdf-parse')
    mockGetText.mockResolvedValue({ text: 'hello world' })
    const buf = Buffer.from('test-content')
    await extractAndChunk(buf)
    expect(PDFParse).toHaveBeenCalledWith({ data: buf })
  })

  it('calls destroy() after a successful extraction', async () => {
    mockGetText.mockResolvedValue({ text: 'hello world' })
    await extractAndChunk(Buffer.from('fake'))
    expect(mockDestroy).toHaveBeenCalledTimes(1)
  })

  it('calls destroy() even when getText() throws', async () => {
    mockGetText.mockRejectedValue(new Error('parse error'))
    await expect(extractAndChunk(Buffer.from('fake'))).rejects.toThrow('parse error')
    expect(mockDestroy).toHaveBeenCalledTimes(1)
  })

  it('throws PdfParseError when getText() throws a known pdf-parse user error', async () => {
    const err = Object.assign(new Error('Invalid PDF structure.'), { name: 'InvalidPDFException' })
    mockGetText.mockRejectedValueOnce(err)
    await expect(extractAndChunk(Buffer.from('fake'))).rejects.toThrow(PdfParseError)
    expect(mockDestroy).toHaveBeenCalledTimes(1)
  })

  it('re-throws non-PDF errors unchanged', async () => {
    const err = new TypeError('unexpected runtime error')
    mockGetText.mockRejectedValueOnce(err)
    await expect(extractAndChunk(Buffer.from('fake'))).rejects.toThrow(TypeError)
  })
})
