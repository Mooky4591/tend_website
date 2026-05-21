import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/**
 * POST /api/admin/conversations/[userId]/flag
 * Manually flags or unflags the most recent conversation for a user.
 * Body: `reason` (string) or `unflag=true` to clear.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.redirect(new URL('/admin/login', 'http://localhost'))
  }

  const supabase = createServiceClient()
  const formData = await request.formData()
  const unflag = formData.get('unflag') === 'true'
  const reason = formData.get('reason')

  // Find the most recent conversation
  const { data: latest } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (latest) {
    if (unflag) {
      await supabase
        .from('conversations')
        .update({ manually_flagged: false, manually_flagged_reason: null })
        .eq('id', latest.id)
    } else {
      await supabase
        .from('conversations')
        .update({
          manually_flagged: true,
          manually_flagged_reason: typeof reason === 'string' ? reason.trim() : null,
        })
        .eq('id', latest.id)
    }
  }

  return NextResponse.redirect(
    new URL(`/admin/conversation/${params.userId}`, 'http://localhost'),
  )
}
