import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/auth'
import UploadForm from './UploadForm'
import DeleteDocButton from './DeleteDocButton'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default async function DocsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('warranty_documents')
    .select('plan_name, created_at')
    .order('created_at', { ascending: false })

  const planMap = new Map<string, { plan_name: string; chunk_count: number; uploaded_at: string }>()
  for (const row of (data ?? []) as { plan_name: string; created_at: string }[]) {
    if (!planMap.has(row.plan_name)) {
      planMap.set(row.plan_name, { plan_name: row.plan_name, chunk_count: 1, uploaded_at: row.created_at })
    } else {
      planMap.get(row.plan_name)!.chunk_count++
    }
  }
  const docs = Array.from(planMap.values()).sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))

  async function deleteDoc(planName: string) {
    'use server'
    const sc = createClient()
    const { data: { user: u } } = await sc.auth.getUser()
    if (!u) throw new Error('Unauthorized')
    const tenantId = await getTenantId(sc, u.id)
    if (!tenantId) throw new Error('No tenant')
    const { error } = await sc.from('warranty_documents').delete().eq('tenant_id', tenantId).eq('plan_name', planName)
    if (error) throw error
    revalidatePath('/dashboard/docs')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Warranty Documents</h1>
        <p className="text-white/60 text-sm mt-1">
          Documents are chunked and embedded so the AI can reference them during homeowner conversations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Uploaded documents</h2>
          {docs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border/20 p-8 text-center text-sm text-muted-foreground/50">
              No documents uploaded yet
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map(d => (
                <div key={d.plan_name} className="bg-white rounded-2xl border border-border/20 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.plan_name}</p>
                    <p className="text-xs text-muted-foreground/50 mt-0.5">
                      {d.chunk_count} chunks · uploaded {formatDate(d.uploaded_at)}
                    </p>
                  </div>
                  <DeleteDocButton action={deleteDoc.bind(null, d.plan_name)} planName={d.plan_name} />
                </div>
              ))}
            </div>
          )}
        </div>

        <UploadForm />
      </div>
    </div>
  )
}
