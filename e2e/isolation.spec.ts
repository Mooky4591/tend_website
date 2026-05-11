import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// Start every test in this file with no session so we can sign in as tenant B
test.use({ storageState: { cookies: [], origins: [] } })

function getSeedState(): { aliceId: string; daveId: string | null } | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '.seed-state.json'), 'utf8'))
  } catch {
    return null
  }
}

test.describe('multi-tenant isolation', () => {
  test.beforeEach(async ({ page }) => {
    const emailB = process.env.E2E_TEST_EMAIL_B
    const passwordB = process.env.E2E_TEST_PASSWORD_B
    if (!emailB || !passwordB) {
      test.skip()
      return
    }
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.fill('#email', emailB)
    await page.fill('#password', passwordB)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard', { timeout: 20_000 })
  })

  test('users list does not expose tenant A homeowners to tenant B', async ({ page }) => {
    const seed = getSeedState()
    if (!seed) { test.skip(); return }

    await page.goto('/dashboard/homeowners')
    await expect(page.locator('text=E2E Alice')).not.toBeVisible()
    await expect(page.locator('text=E2E Bob')).not.toBeVisible()
    await expect(page.locator('text=E2E Carol')).not.toBeVisible()
  })

  test('direct URL to tenant A homeowner detail returns not found', async ({ page }) => {
    const seed = getSeedState()
    if (!seed?.aliceId) { test.skip(); return }

    await page.goto(`/dashboard/homeowners/${seed.aliceId}`)
    // notFound() renders the 404 page — Alice's name must not appear
    await expect(page.locator('text=E2E Alice')).not.toBeVisible({ timeout: 5_000 })
    await expect(page.locator('p.font-mono')).not.toBeVisible({ timeout: 5_000 })
  })

  test('tenant B user sees only their own homeowners', async ({ page }) => {
    const seed = getSeedState()
    if (!seed?.daveId) { test.skip(); return }

    await page.goto('/dashboard/homeowners')
    await expect(page.locator('text=E2E Dave')).toBeVisible()
    // Tenant A homeowners must still not be visible
    await expect(page.locator('text=E2E Alice')).not.toBeVisible()
  })
})
