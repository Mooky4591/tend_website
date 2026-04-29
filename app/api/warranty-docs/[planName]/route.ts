import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { planName: string } },
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('auth_user_id', user.id)
    .single()
  if (!membership) return NextResponse.json({ error: 'No tenant' }, { status: 403 })

  const planName = decodeURIComponent(params.planName)

  const { error } = await supabase
    .from('warranty_documents')
    .delete()
    .eq('tenant_id', membership.tenant_id)
    .eq('plan_name', planName)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
