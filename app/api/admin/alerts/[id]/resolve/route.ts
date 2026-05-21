import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/**
 * POST /api/admin/alerts/[id]/resolve
 * Marks a system alert as resolved.
 * Uses 303 See Other so browser form submissions follow the redirect as GET.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 })
  }

  const supabase = createServiceClient()

  await supabase
    .from('system_alerts')
    .update({ resolved: true })
    .eq('id', params.id)

  return NextResponse.redirect(new URL('/admin/alerts', request.url), { status: 303 })
}
