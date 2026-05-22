import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { validateOnboardingCompleteness } from '@/lib/services/onboardingValidator'
import { unauthorized, forbidden, notFound, serverError, ok } from '@/lib/api-response'

/**
 * POST /api/users/[id]/onboarding-check
 *
 * Triggered whenever onboarding_complete is set to true for a user.
 * Runs the onboarding completeness validator and returns the gap list.
 * Requires the caller to be an authenticated portal staff member (RLS check)
 * or a cron job using the CRON_SECRET header.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // Allow cron/internal callers with the CRON_SECRET header
  const cronSecret = request.headers.get('x-cron-secret')
  const isInternalCaller = cronSecret && cronSecret === process.env.CRON_SECRET

  if (!isInternalCaller) {
    // Fall back to portal staff auth
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const { data: membership } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!membership) return forbidden('Portal access required')

    // Verify the target user belongs to the caller's tenant (RLS-level guard)
    const { data: targetUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', params.id)
      .eq('tenant_id', membership.tenant_id)
      .single()

    if (!targetUser) return notFound('Homeowner not found')
  }

  // Run the validator using the service client so it can update users across RLS
  const serviceClient = createServiceClient()

  try {
    const result = await validateOnboardingCompleteness(serviceClient, params.id)
    return ok(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return serverError(`Onboarding check failed: ${message}`)
  }
}
