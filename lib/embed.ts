import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: chunks,
  })
  return response.data
    .sort((a, b) => a.index - b.index)
    .map(d => d.embedding)
}
