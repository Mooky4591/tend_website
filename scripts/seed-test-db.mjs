#!/usr/bin/env node
// Run with: npm run seed:test
// Seeds the test Supabase project with realistic demo data:
//   - 45 homeowners with descriptive names covering every status and failure scenario
//   - Conversations for completed-onboarding homeowners
//   - 6 months of billing snapshots
//
// Seed homeowners are identified by phone prefix +15552 so the script is safely re-runnable.
// Run npm run seed:e2e first to create the tenant; this script reads the tenant ID from
// e2e/.seed-state.json.

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function loadEnv() {
  const raw = readFileSync(join(ROOT, '.env.local'), 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const val = trimmed.slice(eq + 1).trim()
    env[trimmed.slice(0, eq).trim()] = val.replace(/^(['"])(.*)\1$/, '$2')
  }
  return env
}

const env = loadEnv()
const url = env.SUPABASE_TEST_URL
const key = env.SUPABASE_TEST_SERVICE_ROLE_KEY
const seedState = JSON.parse(readFileSync(join(ROOT, 'e2e/.seed-state.json'), 'utf8'))
const TENANT_ID = seedState.tenantId

if (!url || !key) {
  console.error('Missing SUPABASE_TEST_URL or SUPABASE_TEST_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

if (!TENANT_ID) {
  console.error('e2e/.seed-state.json is missing tenantId — run npm run seed:e2e first')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

// ── Helpers ──────────────────────────────────────────────────────────────────

function seedPhone(i) {
  return `+15552${String(i).padStart(6, '0')}`
}

// Spread created_at across the last 6 months, oldest first
function createdAt(i, total) {
  const base = new Date('2025-11-01T00:00:00Z')
  base.setDate(base.getDate() + Math.floor((i / total) * 180))
  return base.toISOString()
}

const STATES = ['TX', 'CA', 'FL', 'GA', 'NC', 'OH', 'PA', 'TN', 'AZ', 'CO']
const CITIES = {
  TX: ['Austin', 'Houston', 'Dallas'],
  CA: ['Los Angeles', 'San Diego', 'San Jose'],
  FL: ['Miami', 'Orlando', 'Tampa'],
  GA: ['Atlanta', 'Savannah', 'Augusta'],
  NC: ['Charlotte', 'Raleigh', 'Durham'],
  OH: ['Columbus', 'Cleveland', 'Cincinnati'],
  PA: ['Philadelphia', 'Pittsburgh', 'Allentown'],
  TN: ['Nashville', 'Memphis', 'Knoxville'],
  AZ: ['Phoenix', 'Tucson', 'Scottsdale'],
  CO: ['Denver', 'Colorado Springs', 'Aurora'],
}
const ZIPS = {
  TX: '78701', CA: '90001', FL: '33101', GA: '30301', NC: '28201',
  OH: '43201', PA: '19101', TN: '37201', AZ: '85001', CO: '80201',
}
const STREET_NAMES = ['Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Birch', 'Walnut', 'Willow']
const STREET_TYPES = ['Ave', 'St', 'Blvd', 'Dr', 'Ln', 'Rd']

function pick(arr, i) { return arr[i % arr.length] }

// ── Homeowner definitions ─────────────────────────────────────────────────────
// Every possible status and failure scenario, named to describe what they represent.

const HOMEOWNER_SPECS = [
  // Completed onboarding — 20 homeowners
  ...Array.from({ length: 20 }, (_, i) => ({
    first_name: `completed-onboarding-${String(i + 1).padStart(2, '0')}`,
    onboarding_complete: true,
    onboarding_status: null,
    opted_out: false,
    failure_reason: null,
  })),

  // Pending — added to system, welcome SMS not sent yet (3)
  { first_name: 'pending-awaiting-sms-01', onboarding_complete: false, onboarding_status: null, opted_out: false, failure_reason: null },
  { first_name: 'pending-awaiting-sms-02', onboarding_complete: false, onboarding_status: null, opted_out: false, failure_reason: null },
  { first_name: 'pending-awaiting-sms-03', onboarding_complete: false, onboarding_status: null, opted_out: false, failure_reason: null },

  // Queued — SMS scheduled but not yet delivered (3)
  { first_name: 'queued-sms-scheduled-01', onboarding_complete: false, onboarding_status: 'queued', opted_out: false, failure_reason: null },
  { first_name: 'queued-sms-scheduled-02', onboarding_complete: false, onboarding_status: 'queued', opted_out: false, failure_reason: null },
  { first_name: 'queued-sms-scheduled-03', onboarding_complete: false, onboarding_status: 'queued', opted_out: false, failure_reason: null },

  // Failed — invalid phone number (2)
  { first_name: 'failed-invalid-number-01', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'invalid_number' },
  { first_name: 'failed-invalid-number-02', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'invalid_number' },

  // Failed — landline (cannot receive SMS) (2)
  { first_name: 'failed-landline-01', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'landline' },
  { first_name: 'failed-landline-02', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'landline' },

  // Failed — disconnected number (2)
  { first_name: 'failed-disconnected-01', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'disconnected' },
  { first_name: 'failed-disconnected-02', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'disconnected' },

  // Failed — delivery timed out (2)
  { first_name: 'failed-delivery-timeout-01', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'delivery_timeout' },
  { first_name: 'failed-delivery-timeout-02', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'delivery_timeout' },

  // Failed — network error (2)
  { first_name: 'failed-network-error-01', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'network_error' },
  { first_name: 'failed-network-error-02', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'network_error' },

  // Failed — carrier blocked (2)
  { first_name: 'failed-carrier-blocked-01', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'carrier_blocked' },
  { first_name: 'failed-carrier-blocked-02', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'carrier_blocked' },

  // Failed — account/provider error (2)
  { first_name: 'failed-account-error-01', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'account_error' },
  { first_name: 'failed-account-error-02', onboarding_complete: false, onboarding_status: 'failed', opted_out: false, failure_reason: 'account_error' },

  // Opted out — replied STOP to the welcome SMS (5)
  { first_name: 'opted-out-01', onboarding_complete: false, onboarding_status: null, opted_out: true, failure_reason: null },
  { first_name: 'opted-out-02', onboarding_complete: false, onboarding_status: null, opted_out: true, failure_reason: null },
  { first_name: 'opted-out-03', onboarding_complete: false, onboarding_status: null, opted_out: true, failure_reason: null },
  { first_name: 'opted-out-04', onboarding_complete: false, onboarding_status: null, opted_out: true, failure_reason: null },
  { first_name: 'opted-out-05', onboarding_complete: false, onboarding_status: null, opted_out: true, failure_reason: null },
]

const TOTAL = HOMEOWNER_SPECS.length

function makeUser(spec, i) {
  const state = pick(STATES, i)
  const cities = CITIES[state]
  const city = cities[i % cities.length]
  const houseNum = 100 + ((i * 13) % 900)
  const address = `${houseNum} ${pick(STREET_NAMES, i + 3)} ${pick(STREET_TYPES, i)}`

  return {
    tenant_id: TENANT_ID,
    first_name: spec.first_name,
    last_name: spec.last_name ?? null,
    phone_number: seedPhone(i),
    address,
    city,
    state,
    zip: ZIPS[state],
    onboarding_complete: spec.onboarding_complete,
    onboarding_status: spec.onboarding_status,
    opted_out: spec.opted_out,
    failure_reason: spec.failure_reason,
    created_at: createdAt(i, TOTAL),
  }
}

const USERS = HOMEOWNER_SPECS.map((spec, i) => makeUser(spec, i))

// ── Conversations ─────────────────────────────────────────────────────────────
// 3 messages (user → assistant → user) per completed-onboarding homeowner.

const CONVERSATION_TOPICS = [
  {
    messages: [
      { role: 'user', content: 'Hi, my HVAC filter light came on. What should I do?' },
      { role: 'assistant', content: 'Time to replace the filter! For most systems, a 1-inch filter should be changed every 1–3 months. Do you know your filter size?' },
      { role: 'user', content: 'I think it is 16x25x1. I will grab one from the hardware store.' },
    ],
  },
  {
    messages: [
      { role: 'user', content: 'When should I flush my water heater?' },
      { role: 'assistant', content: 'Annually is the recommendation. It removes sediment and extends the life of the unit. Would you like a reminder set for next year?' },
      { role: 'user', content: 'Yes please, same time next year works.' },
    ],
  },
  {
    messages: [
      { role: 'user', content: 'I noticed some missing shingles after the storm. Who should I call?' },
      { role: 'assistant', content: 'Contact a licensed roofer for an inspection as soon as possible to prevent water damage. Would you like help finding one in your area?' },
      { role: 'user', content: 'That would be great, thank you.' },
    ],
  },
  {
    messages: [
      { role: 'user', content: 'My gutters are overflowing when it rains. Do I need to clean them?' },
      { role: 'assistant', content: 'Yes — clogged gutters can cause water damage to your foundation and siding. Fall and spring cleaning is recommended. Would you like a reminder?' },
      { role: 'user', content: 'Yes, add it to my reminders please.' },
    ],
  },
  {
    messages: [
      { role: 'user', content: 'There is a slow drip under my kitchen sink. Should I be worried?' },
      { role: 'assistant', content: 'A slow drip can indicate a failing seal or loose connection. It is worth having a plumber take a look before it becomes a larger leak.' },
      { role: 'user', content: 'I will call a plumber today.' },
    ],
  },
  {
    messages: [
      { role: 'user', content: 'My circuit breaker keeps tripping. Is that dangerous?' },
      { role: 'assistant', content: 'Frequent tripping usually means a circuit is overloaded or there is a wiring issue. Have a licensed electrician inspect it — do not keep resetting it.' },
      { role: 'user', content: 'Good to know. Scheduling an electrician now.' },
    ],
  },
  {
    messages: [
      { role: 'user', content: 'I am seeing some small bugs near my windows. Could it be termites?' },
      { role: 'assistant', content: 'Possibly. Look for small wings or mud tubes as signs. A pest control inspection is the safest next step — early treatment is much cheaper than structural repair.' },
      { role: 'user', content: 'I will book an inspection this week.' },
    ],
  },
]

// ── Billing snapshots ─────────────────────────────────────────────────────────
// 6 months showing steady growth toward 20 active homeowners by April 2026.

const SNAPSHOTS = [
  { billing_month: '2025-11-01', active_users: 6,  new_users: 6,  reminders_sent: 12, conversations: 24  },
  { billing_month: '2025-12-01', active_users: 10, new_users: 4,  reminders_sent: 20, conversations: 40  },
  { billing_month: '2026-01-01', active_users: 14, new_users: 4,  reminders_sent: 28, conversations: 56  },
  { billing_month: '2026-02-01', active_users: 17, new_users: 3,  reminders_sent: 34, conversations: 68  },
  { billing_month: '2026-03-01', active_users: 19, new_users: 2,  reminders_sent: 38, conversations: 76  },
  { billing_month: '2026-04-01', active_users: 20, new_users: 1,  reminders_sent: 40, conversations: 80  },
].map(s => ({ ...s, tenant_id: TENANT_ID }))

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding tenant ${TENANT_ID} in ${url}\n`)

  // Remove previously seeded demo users (safe: only touches +15552 phone prefix)
  console.log('Removing previous seed users...')
  const { data: prevUsers, error: prevErr } = await supabase
    .from('users')
    .select('id')
    .eq('tenant_id', TENANT_ID)
    .like('phone_number', '+15552%')
  if (prevErr) { console.error('Lookup previous seed users failed:', prevErr); process.exit(1) }

  if (prevUsers?.length) {
    const ids = prevUsers.map(u => u.id)
    const { error: convDelErr } = await supabase.from('conversations').delete().in('user_id', ids)
    if (convDelErr) { console.error('Delete previous conversations failed:', convDelErr); process.exit(1) }
    const { error: remDelErr } = await supabase.from('reminders').delete().in('user_id', ids)
    if (remDelErr) { console.error('Delete previous reminders failed:', remDelErr); process.exit(1) }
    const { error: delErr } = await supabase.from('users').delete().in('id', ids)
    if (delErr) { console.error('Delete users failed:', delErr); process.exit(1) }
    console.log(`  Removed ${prevUsers.length} previous seed users`)
  }

  // Insert homeowners
  console.log(`Inserting ${USERS.length} homeowners...`)
  const { data: inserted, error: usersErr } = await supabase
    .from('users')
    .insert(USERS)
    .select('id, first_name, onboarding_complete, onboarding_status, opted_out, failure_reason')
  if (usersErr) { console.error('Insert users failed:', usersErr); process.exit(1) }

  // Insert conversations for completed-onboarding homeowners
  const completed = inserted.filter(u => u.onboarding_complete)
  const conversations = completed.flatMap((u, idx) => {
    const topic = CONVERSATION_TOPICS[idx % CONVERSATION_TOPICS.length]
    return topic.messages.map(m => ({
      user_id: u.id,
      tenant_id: TENANT_ID,
      role: m.role,
      content: m.content,
    }))
  })
  console.log(`Inserting ${conversations.length} conversations (${completed.length} homeowners × 3 messages)...`)
  const { error: convErr } = await supabase.from('conversations').insert(conversations)
  if (convErr) { console.error('Insert conversations failed:', convErr); process.exit(1) }

  // Insert reminders for completed-onboarding homeowners
  const REMINDER_TYPES = [
    'hvac_filter', 'hvac_service', 'water_heater_flush', 'roof_inspection',
    'gutter_cleaning', 'plumbing_inspection', 'electrical_inspection',
  ]
  const reminders = completed.flatMap((u, idx) => [
    { user_id: u.id, reminder_type: REMINDER_TYPES[idx % REMINDER_TYPES.length],       due_date: '2026-07-01', sent: false },
    { user_id: u.id, reminder_type: REMINDER_TYPES[(idx + 3) % REMINDER_TYPES.length], due_date: '2026-10-01', sent: false },
  ])
  console.log(`Inserting ${reminders.length} reminders...`)
  const { error: remErr } = await supabase.from('reminders').insert(reminders)
  if (remErr) { console.error('Insert reminders failed:', remErr); process.exit(1) }

  // Replace billing snapshots
  console.log(`Replacing billing snapshots (${SNAPSHOTS.length} months)...`)
  const { error: snapDelErr } = await supabase
    .from('monthly_billing_snapshots')
    .delete()
    .eq('tenant_id', TENANT_ID)
  if (snapDelErr) { console.error('Delete snapshots failed:', snapDelErr); process.exit(1) }
  const { error: snapErr } = await supabase.from('monthly_billing_snapshots').insert(SNAPSHOTS)
  if (snapErr) { console.error('Insert snapshots failed:', snapErr); process.exit(1) }

  // Summary
  const complete  = inserted.filter(u => u.onboarding_complete).length
  const optedOut  = inserted.filter(u => u.opted_out).length
  const queued    = inserted.filter(u => u.onboarding_status === 'queued').length
  const failed    = inserted.filter(u => u.onboarding_status === 'failed').length
  const pending   = inserted.filter(u => !u.onboarding_complete && !u.opted_out && !u.onboarding_status).length

  const failureCounts = {}
  for (const u of inserted.filter(u => u.failure_reason)) {
    failureCounts[u.failure_reason] = (failureCounts[u.failure_reason] ?? 0) + 1
  }

  console.log('\nDone.')
  console.log(`  Homeowners: ${inserted.length} total`)
  console.log(`    Completed onboarding: ${complete}`)
  console.log(`    Pending (no SMS yet): ${pending}`)
  console.log(`    Queued:               ${queued}`)
  console.log(`    Failed:               ${failed}`)
  for (const [reason, count] of Object.entries(failureCounts)) {
    console.log(`      ${reason}: ${count}`)
  }
  console.log(`    Opted out:            ${optedOut}`)
  console.log(`  Conversations: ${conversations.length} (${completed.length} homeowners × 3 messages)`)
  console.log(`  Reminders:     ${reminders.length}`)
  console.log(`  Billing:       ${SNAPSHOTS.length} months (Nov 2025 – Apr 2026)`)
  console.log('\nNote: E2E users (Alice, Bob, Carol, Dave) are unchanged.')
}

main().catch(err => { console.error(err); process.exit(1) })
