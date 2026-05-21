import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client authenticated with the service role key.
 * This client bypasses Row Level Security and must only be used in:
 * - Server-side cron job routes (app/api/cron/*)
 * - Admin action routes (app/api/admin/*)
 * - Background service functions that must write across tenant boundaries
 *
 * Never expose this client to browser code or user-facing contexts.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable',
    )
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
