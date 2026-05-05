import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/auth'
import { unauthorized, forbidden, serverError, ok } from '@/lib/api-response'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { planName: string } },
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const tenantId = await getTenantId(supabase, user.id)
  if (!tenantId) return forbidden()

  const { error } = await supabase
    .from('warranty_documents')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('plan_name', params.planName)

  if (error) return serverError(error.message)

  return ok({ ok: true })
}
