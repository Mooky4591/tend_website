import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/**
 * POST /api/admin/onboarding-gaps/[userId]/resolve
 * Clears the onboarding gap flag for a user (sets onboarding_gap_flagged = false).
 * Uses 303 See Other so browser form submissions follow the redirect as GET.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 })
  }

  const supabase = createServiceClient()

  await supabase
    .from('users')
    .update({ onboarding_gap_flagged: false })
    .eq('id', params.userId)

  return NextResponse.redirect(new URL('/admin/onboarding-gaps', request.url), { status: 303 })
}
