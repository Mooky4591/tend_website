/**
 * E2E seed script — run with: npm run seed:e2e
 *
 * Required env vars (add to .env.local):
 *   SUPABASE_TEST_URL
 *   SUPABASE_TEST_SERVICE_ROLE_KEY
 *   SUPABASE_TEST_ANON_KEY
 *   E2E_TEST_EMAIL
 *   E2E_TEST_PASSWORD
 *
 * Writes known IDs to e2e/.seed-state.json so spec files can reference
 * specific users without navigating the UI to discover them.
 *
 * Safe to run repeatedly — idempotent.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.SUPABASE_TEST_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY
const ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY
const E2E_EMAIL = process.env.E2E_TEST_EMAIL
const E2E_PASSWORD = process.env.E2E_TEST_PASSWORD

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY || !E2E_EMAIL || !E2E_PASSWORD) {
  console.error(
    'Missing required env vars: SUPABASE_TEST_URL, SUPABASE_TEST_SERVICE_ROLE_KEY, SUPABASE_TEST_ANON_KEY, E2E_TEST_EMAIL, E2E_TEST_PASSWORD'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TENANT_NAME = 'E2E Test Tenant'

async function ensureAuthUser(): Promise<string> {
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw error

  const existing = users.find(u => u.email === E2E_EMAIL)
  if (existing) {
    console.log(`  Auth user already exists (${existing.id})`)
    return existing.id
  }

  const { data, error: createError } = await supabase.auth.admin.createUser({
    email: E2E_EMAIL!,
    password: E2E_PASSWORD!,
    email_confirm: true,
  })
  if (createError) throw createError
  console.log(`  Created auth user (${data.user.id})`)
  return data.user.id
}

async function ensureTenant(): Promise<string> {
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('name', TENANT_NAME)
    .maybeSingle()

  if (existing) {
    console.log(`  Tenant already exists (${existing.id})`)
    return existing.id
  }

  const { data, error } = await supabase
    .from('tenants')
    .insert({ name: TENANT_NAME, company_code: 'E2E_TEST' })
    .select('id')
    .single()
  if (error) throw error
  console.log(`  Created tenant (${data.id})`)
  return data.id
}

async function linkUserToTenant(authUserId: string, tenantId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('tenant_users')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (existing) {
    console.log('  Auth user already linked to tenant')
    return
  }

  const { error } = await supabase
    .from('tenant_users')
    .insert({ tenant_id: tenantId, auth_user_id: authUserId, role: 'admin' })
  if (error) throw error
  console.log('  Auth user linked to tenant')
}

async function clearTenantData(tenantId: string): Promise<void> {
  const { data: existingUsers } = await supabase
    .from('users')
    .select('id')
    .eq('tenant_id', tenantId)

  if (existingUsers?.length) {
    const ids = existingUsers.map(u => u.id)
    const { error: remErr } = await supabase.from('reminders').delete().in('user_id', ids)
    if (remErr) throw new Error(`Failed to delete reminders: ${remErr.message}`)
    const { error: convErr } = await supabase.from('conversations').delete().in('user_id', ids)
    if (convErr) throw new Error(`Failed to delete conversations: ${convErr.message}`)
    const { error: userErr } = await supabase.from('users').delete().in('id', ids)
    if (userErr) throw new Error(`Failed to delete users: ${userErr.message}`)
    console.log(`  Cleared ${ids.length} existing homeowner(s) and their data`)
  } else {
    console.log('  No existing homeowners to clear')
  }
}

async function seedHomeowners(tenantId: string): Promise<{ aliceId: string }> {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        tenant_id: tenantId,
        first_name: 'E2E Alice',
        phone_number: '+15550000001',
        address: '1 Test Lane',
        city: 'Atlanta',
        state: 'GA',
        zip: '30301',
        onboarding_complete: true,
        onboarding_status: null,
        opted_out: false,
      },
      {
        tenant_id: tenantId,
        first_name: 'E2E Bob',
        phone_number: '+15550000002',
        city: 'Atlanta',
        state: 'GA',
        onboarding_complete: false,
        onboarding_status: 'queued',
        opted_out: false,
      },
      {
        tenant_id: tenantId,
        first_name: 'E2E Carol',
        phone_number: '+15550000003',
        city: 'Atlanta',
        state: 'GA',
        onboarding_complete: false,
        onboarding_status: null,
        opted_out: true,
      },
    ])
    .select('id, first_name')

  if (error) throw error
  console.log(`  Created homeowners: ${data.map(h => h.first_name).join(', ')}`)

  const alice = data.find(h => h.first_name === 'E2E Alice')!
  return { aliceId: alice.id }
}

async function seedConversations(aliceId: string, tenantId: string): Promise<void> {
  const { error } = await supabase.from('conversations').insert([
    {
      user_id: aliceId,
      tenant_id: tenantId,
      role: 'user',
      content: 'Hi, I need help with my HVAC system.',
    },
    {
      user_id: aliceId,
      tenant_id: tenantId,
      role: 'assistant',
      content: 'I can help with that! When was your last HVAC service?',
    },
    {
      user_id: aliceId,
      tenant_id: tenantId,
      role: 'user',
      content: 'About a year ago I think.',
    },
    {
      user_id: aliceId,
      tenant_id: tenantId,
      role: 'staff',
      content: 'Scheduling a technician visit for you now.',
    },
  ])
  if (error) throw error
  console.log('  Created 4 conversation messages for E2E Alice')
}

async function seedReminders(aliceId: string): Promise<void> {
  const { error } = await supabase.from('reminders').insert([
    { user_id: aliceId, reminder_type: 'hvac_filter', due_date: '2099-06-01', sent: false },
    { user_id: aliceId, reminder_type: 'roof_inspection', due_date: '2099-09-01', sent: false },
  ])
  if (error) throw error
  console.log('  Created 2 reminders for E2E Alice')
}

/**
 * Verify that the RLS policies from supabase/migrations/ have been applied to
 * the test database. Uses the anon key + the E2E user's JWT (authenticated role)
 * to simulate what the app does at runtime.
 *
 * If the policies are missing the authenticated user cannot read their own
 * tenant_users row, which causes every dashboard query to return empty results
 * and makes detail-page tests time out with 404s.
 */
async function verifyRLSPolicies(): Promise<void> {
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: E2E_EMAIL!,
    password: E2E_PASSWORD!,
  })

  if (signInError || !signInData.session) {
    console.error(
      `\n  ❌  RLS verification failed — could not sign in as the E2E user.\n` +
      `      Error: ${signInError?.message ?? 'no session returned'}\n\n` +
      `      Check E2E_TEST_EMAIL / E2E_TEST_PASSWORD in .env.local and ensure\n` +
      `      the auth user exists in the test Supabase project.\n`
    )
    process.exit(1)
  }

  // anon key + user JWT → PostgREST uses "authenticated" role with auth.uid() set
  const userClient = createClient(SUPABASE_URL!, ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${signInData.session.access_token}` } },
  })

  const { data: rows } = await userClient.from('tenant_users').select('id').limit(1)

  if (!rows || rows.length === 0) {
    const projectRef = new URL(SUPABASE_URL!).hostname.split('.')[0]
    console.error(`
  ❌  RLS policies are missing from the test Supabase database.

  The E2E user cannot read their own tenant_users row, which means the
  migration files in supabase/migrations/ have not been applied to the
  test project yet.

  Fix (one-time setup — takes about 1 minute):

  1. Open the Supabase SQL Editor:
     https://supabase.com/dashboard/project/${projectRef}/sql/new

  2. Paste and run:  supabase/migrations/20260428000000_tenant_users.sql
  3. Paste and run:  supabase/migrations/20260429000001_portal_rls_policies.sql

  4. Re-run this script: npm run seed:e2e
`)
    process.exit(1)
  }

  console.log('  ✅ RLS policies verified')
}

async function main() {
  console.log('Seeding E2E test database...\n')

  console.log('1. Auth user')
  const authUserId = await ensureAuthUser()

  console.log('2. Tenant')
  const tenantId = await ensureTenant()

  console.log('3. Tenant membership')
  await linkUserToTenant(authUserId, tenantId)

  console.log('4. Clearing existing homeowner data')
  await clearTenantData(tenantId)

  console.log('5. Homeowners')
  const { aliceId } = await seedHomeowners(tenantId)

  console.log('6. Conversations')
  await seedConversations(aliceId, tenantId)

  console.log('7. Reminders')
  await seedReminders(aliceId)

  const stateFile = path.join(__dirname, '.seed-state.json')
  fs.writeFileSync(stateFile, JSON.stringify({ tenantId, aliceId }, null, 2))

  console.log('\n8. RLS policy verification')
  await verifyRLSPolicies()

  console.log('\nSeed complete.')
  console.log(`  Tenant ID : ${tenantId}`)
  console.log(`  Alice ID  : ${aliceId}`)
  console.log(`  State written to e2e/.seed-state.json`)
}

main().catch(err => {
  console.error('\nSeed failed:', err.message ?? err)
  process.exit(1)
})
