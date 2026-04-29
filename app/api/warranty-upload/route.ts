import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractAndChunk } from '@/lib/pdf'
import { embedChunks } from '@/lib/embed'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('auth_user_id', user.id)
    .single()
  if (!membership) return NextResponse.json({ error: 'No tenant' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const planName = (formData.get('plan_name') as string | null)?.trim()

  if (!file || !planName) {
    return NextResponse.json({ error: 'file and plan_name are required' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 415 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const chunks = await extractAndChunk(buffer)
  if (chunks.length === 0) {
    return NextResponse.json({ error: 'No text could be extracted from this PDF' }, { status: 422 })
  }

  const embeddings = await embedChunks(chunks)

  // Atomic swap: snapshot old IDs, insert new, then delete old
  const { data: existing } = await supabase
    .from('warranty_documents')
    .select('id')
    .eq('tenant_id', membership.tenant_id)
    .eq('plan_name', planName)

  const oldIds = (existing ?? []).map(r => r.id)

  const rows = chunks.map((content, i) => ({
    tenant_id: membership.tenant_id,
    plan_name: planName,
    chunk_index: i,
    content,
    embedding: embeddings[i],
  }))

  const { error: insertError } = await supabase
    .from('warranty_documents')
    .insert(rows)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  if (oldIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('warranty_documents')
      .delete()
      .in('id', oldIds)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Chunks inserted but old chunks could not be removed: ' + deleteError.message },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ chunksInserted: chunks.length })
}
