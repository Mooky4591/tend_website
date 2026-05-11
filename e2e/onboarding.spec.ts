import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

test.use({ storageState: 'e2e/.auth/user.json' })

type SeedState = {
  aliceId: string
  evaId: string    // failed / invalid_number  → update phone number
  frankId: string  // failed / delivery_timeout → retry
  graceId: string  // failed / carrier_blocked  → contact support
  daveId: string | null
}

function getSeedState(): SeedState | null {
  const stateFile = path.join(__dirname, '.seed-state.json')
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'))
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Tooltip hover tests
// ---------------------------------------------------------------------------

test.describe('failed status badge tooltips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/homeowners')
  })

  test('invalid_number badge shows update phone number tooltip on hover', async ({ page }) => {
    const seed = getSeedState()
    if (!seed?.evaId) { test.skip(); return }

    const row = page.locator('tr', { hasText: 'E2E Eva' })
    await expect(row).toBeVisible()
    await row.locator('span.group').hover()

    await expect(page.locator('text=/update their phone number/i').first()).toBeVisible()
  })

  test('delivery_timeout badge shows retry tooltip on hover', async ({ page }) => {
    const seed = getSeedState()
    if (!seed?.frankId) { test.skip(); return }

    const row = page.locator('tr', { hasText: 'E2E Frank' })
    await expect(row).toBeVisible()
    await row.locator('span.group').hover()

    await expect(page.locator('text=/retry option will be available/i').first()).toBeVisible()
  })

  test('carrier_blocked badge shows contact support tooltip on hover', async ({ page }) => {
    const seed = getSeedState()
    if (!seed?.graceId) { test.skip(); return }

    const row = page.locator('tr', { hasText: 'E2E Grace' })
    await expect(row).toBeVisible()
    await row.locator('span.group').hover()

    await expect(page.locator('text=/support@trytendr\\.org/i').first()).toBeVisible()
  })

  test('all three failed users show a Failed badge', async ({ page }) => {
    const seed = getSeedState()
    if (!seed?.evaId) { test.skip(); return }

    for (const name of ['E2E Eva', 'E2E Frank', 'E2E Grace']) {
      const row = page.locator('tr', { hasText: name })
      // Use exact match to avoid hitting tooltip spans that contain "failed" as a substring
      await expect(row.getByText('Failed', { exact: true })).toBeVisible()
    }
  })

  test('tooltip for a different row does not appear when hovering a different badge', async ({ page }) => {
    const seed = getSeedState()
    if (!seed?.evaId || !seed?.graceId) { test.skip(); return }

    // Hover Eva's badge (update-phone tooltip) — Grace's support tooltip must not be visible
    const evaRow = page.locator('tr', { hasText: 'E2E Eva' })
    await evaRow.locator('span.group').hover()

    await expect(page.locator('text=/update their phone number/i').first()).toBeVisible()
    await expect(page.locator('text=/support@trytendr\\.org/i')).not.toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Onboarding API route
// ---------------------------------------------------------------------------

test.describe('POST /api/users/[id]/onboarding', () => {
  // 401 (unauthenticated) is covered by OnboardingRoute.test.ts — the dev
  // server's Supabase session leaks into fresh Playwright API contexts via the
  // shared cookie jar, making a truly unauthenticated E2E request impractical.

  test('returns 400 when message is missing', async ({ page }) => {
    const seed = getSeedState()
    if (!seed?.evaId) { test.skip(); return }

    const res = await page.request.post(`/api/users/${seed.evaId}/onboarding`, {
      data: {},
    })
    expect(res.status()).toBe(400)
  })

  test('returns 400 when message is blank whitespace', async ({ page }) => {
    const seed = getSeedState()
    if (!seed?.evaId) { test.skip(); return }

    const res = await page.request.post(`/api/users/${seed.evaId}/onboarding`, {
      data: { message: '   ' },
    })
    expect(res.status()).toBe(400)
  })

  test('returns 404 when user id does not exist', async ({ page }) => {
    const res = await page.request.post('/api/users/00000000-0000-0000-0000-000000000000/onboarding', {
      data: { message: 'Hello, welcome!' },
    })
    expect(res.status()).toBe(404)
  })

  test('returns 500 when tenant has no Twilio number configured', async ({ page }) => {
    // The E2E test tenant intentionally has no Twilio number — this verifies
    // that authenticated, valid requests reach the service layer and fail there.
    const seed = getSeedState()
    if (!seed?.evaId) { test.skip(); return }

    const res = await page.request.post(`/api/users/${seed.evaId}/onboarding`, {
      data: { message: 'Hello, welcome to Tendr!' },
    })
    expect(res.status()).toBe(500)
    const body = await res.json()
    expect(body.error).toMatch(/Twilio/i)
  })
})
