import { chunkText } from '@/lib/pdf'

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
