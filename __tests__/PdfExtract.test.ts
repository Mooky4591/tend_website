/**
 * @jest-environment node
 */
import { extractAndChunk } from '@/lib/pdf'

const mockGetText = jest.fn()

jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn().mockImplementation(() => ({ getText: mockGetText })),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

function words(n: number) {
  return Array.from({ length: n }, (_, i) => `word${i}`)
}

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
})
