import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/**
 * POST /api/admin/alerts/[id]/resolve
 * Marks a system alert as resolved.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!isAdminAuthenticated()) {
    return NextResponse.redirect(new URL('/admin/login', 'http://localhost'))
  }

  const supabase = createServiceClient()

  await supabase
    .from('system_alerts')
    .update({ resolved: true })
    .eq('id', params.id)

  return NextResponse.redirect(new URL('/admin/alerts', 'http://localhost'))
}
