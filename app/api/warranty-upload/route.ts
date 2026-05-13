import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { uploadWarrantyDoc } from '@/lib/services/warrantyDocs'
import { getTenantId } from '@/lib/auth'
import { unauthorized, forbidden, badRequest, unsupportedMedia, payloadTooLarge, unprocessableEntity, badGateway, serverError, ok } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const tenantId = await getTenantId(supabase, user.id)
  if (!tenantId) return forbidden()

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const planName = (formData.get('plan_name') as string | null)?.trim()

  if (!file || !planName) {
    return badRequest('file and plan_name are required')
  }
  if (file.type !== 'application/pdf') {
    return unsupportedMedia('Only PDF files are accepted')
  }
  if (file.size > 10 * 1024 * 1024) {
    return payloadTooLarge('File exceeds 10 MB limit')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await uploadWarrantyDoc(supabase, tenantId, planName, buffer)

  if ('error' in result) {
    if (result.status === 422) return unprocessableEntity(result.error)
    if (result.status === 502) return badGateway(result.error)
    return serverError(result.error)
  }

  revalidatePath('/dashboard/docs')
  return ok({ chunksInserted: result.chunksInserted })
}
