#!/usr/bin/env node
// Run with: npm run seed:test
// Seeds the test Supabase project with 50 homeowners + 6 months of billing snapshots.
// Uses SUPABASE_TEST_URL + SUPABASE_TEST_SERVICE_ROLE_KEY from .env.local.
// Seed users are identified by phone prefix +15552 so the script is safely re-runnable.

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

const supabase = createClient(url, key, { auth: { persistSession: false } })

// ── Data pools ──────────────────────────────────────────────────────────────

const STATES = ['TX', 'CA', 'FL', 'GA', 'NC', 'OH', 'PA', 'TN', 'AZ', 'CO']

const CITIES = {
  TX: ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth'],
  CA: ['Los Angeles', 'San Diego', 'San Jose', 'Sacramento', 'Fresno'],
  FL: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
  GA: ['Atlanta', 'Savannah', 'Augusta', 'Columbus', 'Macon'],
  NC: ['Charlotte', 'Raleigh', 'Durham', 'Greensboro', 'Winston-Salem'],
  OH: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'],
  PA: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'],
  TN: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'],
  AZ: ['Phoenix', 'Tucson', 'Scottsdale', 'Mesa', 'Chandler'],
  CO: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood'],
}

const ZIPS = {
  TX: '78701', CA: '90001', FL: '33101', GA: '30301', NC: '28201',
  OH: '43201', PA: '19101', TN: '37201', AZ: '85001', CO: '80201',
}

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Jennifer', 'William', 'Linda',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah',
  'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty',
  'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Dorothy',
  'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle',
  'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Timothy', 'Deborah',
  'Ronald', 'Stephanie',
]

const STREET_NAMES = [
  'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Birch', 'Walnut', 'Willow',
  'Spruce', 'Magnolia', 'Peachtree', 'Sunset', 'Hillside', 'Lakeview',
]

const STREET_TYPES = ['Ave', 'St', 'Blvd', 'Dr', 'Ln', 'Rd', 'Way', 'Ct']

const REMINDER_TYPES = [
  'hvac_filter', 'hvac_service', 'water_heater_flush', 'roof_inspection',
  'gutter_cleaning', 'plumbing_inspection', 'electrical_inspection',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick(arr, i) { return arr[i % arr.length] }

function seedPhone(i) {
  return `+15552${String(i).padStart(6, '0')}`
}

function createdAt(i) {
  // Spread across the last 6 months, oldest first
  const base = new Date('2025-11-01T00:00:00Z')
  base.setDate(base.getDate() + Math.floor((i / 50) * 180))
  return base.toISOString()
}

// ── Build 50 homeowners ───────────────────────────────────────────────────────
// Distribution: 30 complete · 5 pending · 5 queued · 4 failed · 6 opted-out

function makeUser(i) {
  const state = pick(STATES, i)
  const cities = CITIES[state]
  const city = cities[i % cities.length]
  const houseNum = 100 + ((i * 13) % 900)
  const address = `${houseNum} ${pick(STREET_NAMES, i + 3)} ${pick(STREET_TYPES, i)}`

  let onboarding_complete = false
  let onboarding_status = null
  let opted_out = false

  if (i < 30) {
    onboarding_complete = true
  } else if (i < 35) {
    // pending — defaults already set
  } else if (i < 40) {
    onboarding_status = 'queued'
  } else if (i < 44) {
    onboarding_status = 'failed'
  } else {
    opted_out = true
  }

  return {
    tenant_id: TENANT_ID,
    first_name: pick(FIRST_NAMES, i),
    phone_number: seedPhone(i),
    address,
    city,
    state,
    zip: ZIPS[state],
    onboarding_complete,
    onboarding_status,
    opted_out,
    created_at: createdAt(i),
  }
}

const USERS = Array.from({ length: 50 }, (_, i) => makeUser(i))

// ── Billing snapshots ─────────────────────────────────────────────────────────

const SNAPSHOTS = [
  { billing_month: '2025-11-01', active_users:  8, new_users:  8, reminders_sent:  16, conversations:  32 },
  { billing_month: '2025-12-01', active_users: 14, new_users:  6, reminders_sent:  28, conversations:  56 },
  { billing_month: '2026-01-01', active_users: 20, new_users:  7, reminders_sent:  42, conversations:  84 },
  { billing_month: '2026-02-01', active_users: 25, new_users:  5, reminders_sent:  52, conversations: 105 },
  { billing_month: '2026-03-01', active_users: 29, new_users:  4, reminders_sent:  61, conversations: 122 },
  { billing_month: '2026-04-01', active_users: 30, new_users:  2, reminders_sent:  63, conversations: 126 },
].map(s => ({ ...s, tenant_id: TENANT_ID }))

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding tenant ${TENANT_ID} in ${url}\n`)

  // Remove previously seeded users (safe: only touches +15552 phone prefix)
  console.log('Removing previous seed users...')
  const { error: delErr } = await supabase
    .from('users')
    .delete()
    .eq('tenant_id', TENANT_ID)
    .like('phone_number', '+15552%')
  if (delErr) { console.error('Delete users failed:', delErr); process.exit(1) }

  // Insert homeowners
  console.log(`Inserting ${USERS.length} homeowners...`)
  const { data: inserted, error: usersErr } = await supabase
    .from('users')
    .insert(USERS)
    .select('id, first_name, onboarding_complete, onboarding_status, opted_out')
  if (usersErr) { console.error('Insert users failed:', usersErr); process.exit(1) }

  // Insert reminders for fully-onboarded users
  const onboarded = inserted.filter(u => u.onboarding_complete)
  const reminders = onboarded.flatMap((u, idx) => [
    { user_id: u.id, reminder_type: pick(REMINDER_TYPES, idx),     due_date: '2026-07-01', sent: false },
    { user_id: u.id, reminder_type: pick(REMINDER_TYPES, idx + 3), due_date: '2026-10-01', sent: false },
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

  console.log('\nDone.')
  console.log(`  Homeowners: ${inserted.length} total`)
  console.log(`    Complete:  ${complete}`)
  console.log(`    Pending:   ${pending}`)
  console.log(`    Queued:    ${queued}`)
  console.log(`    Failed:    ${failed}`)
  console.log(`    Opted out: ${optedOut}`)
  console.log(`  Reminders:  ${reminders.length}`)
  console.log(`  Billing:    ${SNAPSHOTS.length} months`)
  console.log('\nNote: Alice and Dave (e2e auth users) are unchanged.')
}

main().catch(err => { console.error(err); process.exit(1) })
