import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getTenantId(supabase: SupabaseClient<any, any, any>, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('auth_user_id', userId)
    .single()
  return data?.tenant_id ?? null
}
