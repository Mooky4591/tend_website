import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/user.json' })

test.describe('billing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/billing')
  })

  test('renders Billing heading and subtitle', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Billing')
    await expect(page.locator('text=Monthly usage snapshots')).toBeVisible()
  })

  test('table has Month, Active users, New users, Reminders sent, Conversations columns', async ({ page }) => {
    await expect(page.locator('th', { hasText: 'Month' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Active users' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'New users' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Reminders sent' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Conversations' })).toBeVisible()
  })

  test('shows either billing rows or a "No billing data yet" empty state', async ({ page }) => {
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    if (count === 1) {
      // Only row is the empty state
      await expect(page.locator('text=No billing data yet')).toBeVisible()
    } else {
      // Real billing rows present — first cell in each row should be a month string
      const firstCell = rows.first().locator('td').first()
      await expect(firstCell).toBeVisible()
    }
  })

  test('shows contact section with support email', async ({ page }) => {
    await expect(page.locator('text=Questions about your bill?')).toBeVisible()
    await expect(page.locator('a[href="mailto:support@trytendr.org"]')).toBeVisible()
  })
})
