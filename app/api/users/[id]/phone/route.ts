import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, badRequest, notFound, forbidden, serverError, ok } from '@/lib/api-response'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // tenant_users has UNIQUE (tenant_id, auth_user_id) but allows multiple rows per
  // auth_user_id (one per tenant the staff member belongs to). Fetching all admin
  // memberships and scoping the update with `.in('tenant_id', ...)` keeps multi-tenant
  // admins working — `.maybeSingle()` would throw a "more than one row" error here.
  const { data: memberships, error: memberError } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('auth_user_id', user.id)
    .eq('role', 'admin')

  if (memberError) return serverError(memberError.message)
  if (!memberships || memberships.length === 0) return forbidden('Admin access required')

  const tenantIds = memberships.map(m => m.tenant_id)

  const body = await request.json() as { phoneNumber?: string }
  const phoneNumber = body.phoneNumber?.trim()
  if (!phoneNumber) return badRequest('Phone number is required')

  const { data, error } = await supabase
    .from('users')
    .update({ phone_number: phoneNumber })
    .eq('id', params.id)
    .in('tenant_id', tenantIds)
    .select('id, phone_number')
    .single()

  if (error?.code === 'PGRST116') return notFound('Homeowner not found')
  if (error) return serverError(error.message)

  return ok(data)
}
