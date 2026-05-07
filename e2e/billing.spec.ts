import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/user.json' })

// Seeded by e2e/seed.ts — 3 months in descending order
const SEEDED_MONTHS = [
  { label: 'April 2026',    active: '42', newUsers: '5', reminders: '18', conversations: '130' },
  { label: 'March 2026',    active: '38', newUsers: '3', reminders: '12', conversations:  '95' },
  { label: 'February 2026', active: '35', newUsers: '8', reminders: '20', conversations: '110' },
]

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

  test('table body has exactly 3 seeded rows', async ({ page }) => {
    await expect(page.locator('tbody tr')).toHaveCount(3)
  })

  test('first row shows April 2026 as the most recent month', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first()
    await expect(firstRow.locator('td').first()).toContainText('April 2026')
  })

  test('each seeded row shows correct month and counts', async ({ page }) => {
    const rows = page.locator('tbody tr')
    for (let i = 0; i < SEEDED_MONTHS.length; i++) {
      const m = SEEDED_MONTHS[i]
      const cells = rows.nth(i).locator('td')
      await expect(cells.nth(0)).toContainText(m.label)
      await expect(cells.nth(1)).toContainText(m.active)
      await expect(cells.nth(2)).toContainText(m.newUsers)
      await expect(cells.nth(3)).toContainText(m.reminders)
      await expect(cells.nth(4)).toContainText(m.conversations)
    }
  })

  test('shows contact section with support email', async ({ page }) => {
    await expect(page.locator('text=Questions about your bill?')).toBeVisible()
    await expect(page.locator('a[href="mailto:support@trytendr.org"]')).toBeVisible()
  })
})
