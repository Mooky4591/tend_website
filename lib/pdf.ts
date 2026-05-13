const PDF_USER_ERROR_NAMES = new Set(['InvalidPDFException', 'PasswordException', 'FormatError'])

export class PdfParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PdfParseError'
  }
}

export function chunkText(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks: string[] = []
  const size = 500
  const step = size - 50 // 50-word overlap
  for (let i = 0; i < words.length; i += step) {
    const chunk = words.slice(i, i + size).join(' ')
    if (chunk.trim()) chunks.push(chunk)
  }
  return chunks
}

export async function extractAndChunk(buffer: Buffer): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PDFParse } = require('pdf-parse')
  const parser = new PDFParse({ data: buffer })
  try {
    const { text } = await parser.getText()
    return chunkText(text)
  } catch (err) {
    if (err instanceof Error && PDF_USER_ERROR_NAMES.has(err.name)) {
      throw new PdfParseError(err.message)
    }
    throw err
  } finally {
    await parser.destroy()
  }
}
