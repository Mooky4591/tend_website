import type { SupabaseClient } from '@supabase/supabase-js'
import { extractAndChunk } from '@/lib/pdf'
import { embedChunks } from '@/lib/embed'

type ServiceError = { error: string; status: number }
type ServiceSuccess = { chunksInserted: number }

export async function uploadWarrantyDoc(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  tenantId: string,
  planName: string,
  buffer: Buffer,
): Promise<ServiceError | ServiceSuccess> {
  const chunks = await extractAndChunk(buffer)
  if (chunks.length === 0) {
    return { error: 'No text could be extracted from this PDF', status: 422 }
  }

  let embeddings: number[][]
  try {
    embeddings = await embedChunks(chunks)
  } catch {
    return { error: 'Failed to generate embeddings', status: 502 }
  }

  // Atomic swap: snapshot old IDs, insert new, then delete old
  const { data: existing } = await supabase
    .from('warranty_documents')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('plan_name', planName)

  const oldIds = (existing ?? []).map((r: { id: string }) => r.id)

  const rows = chunks.map((content, i) => ({
    tenant_id: tenantId,
    plan_name: planName,
    chunk_index: i,
    content,
    embedding: embeddings[i],
  }))

  const { error: insertError } = await supabase.from('warranty_documents').insert(rows)

  if (insertError) {
    return { error: insertError.message, status: 500 }
  }

  if (oldIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('warranty_documents')
      .delete()
      .in('id', oldIds)

    if (deleteError) {
      return {
        error: 'Chunks inserted but old chunks could not be removed: ' + deleteError.message,
        status: 500,
      }
    }
  }

  return { chunksInserted: chunks.length }
}
