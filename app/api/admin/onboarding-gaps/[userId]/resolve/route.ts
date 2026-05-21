import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/**
 * POST /api/admin/onboarding-gaps/[userId]/resolve
 * Clears the onboarding gap flag for a user (sets onboarding_gap_flagged = false).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { userId: string } },
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.redirect(new URL('/admin/login', 'http://localhost'))
  }

  const supabase = createServiceClient()

  await supabase
    .from('users')
    .update({ onboarding_gap_flagged: false })
    .eq('id', params.userId)

  return NextResponse.redirect(new URL('/admin/onboarding-gaps', 'http://localhost'))
}
