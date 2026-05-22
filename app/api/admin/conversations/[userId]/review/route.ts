import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/**
 * POST /api/admin/conversations/[userId]/review
 * Marks the most recent conversation for a user as manually reviewed.
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

  // Find the most recent conversation for this user
  const { data: latest } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (latest) {
    await supabase
      .from('conversations')
      .update({ manually_reviewed: true })
      .eq('id', latest.id)
  }

  return NextResponse.redirect(
    new URL(`/admin/conversation/${params.userId}`, request.url),
    { status: 303 },
  )
}
