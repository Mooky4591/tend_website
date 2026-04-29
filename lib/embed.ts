import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const BATCH_SIZE = 100

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  const results: number[][] = []
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    })
    const embeddings = response.data
      .sort((a, b) => a.index - b.index)
      .map(d => d.embedding)
    results.push(...embeddings)
  }
  return results
}
