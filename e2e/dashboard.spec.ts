import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/user.json' })

test.describe('dashboard overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('renders the three stat cards', async ({ page }) => {
    await expect(page.locator('text=Total homeowners')).toBeVisible()
    await expect(page.locator('text=Fully provisioned')).toBeVisible()
    await expect(page.locator('text=Opted out')).toBeVisible()
  })

  test('each stat card shows a numeric value', async ({ page }) => {
    const statValues = page.locator('.text-3xl.font-bold')
    await expect(statValues).toHaveCount(3)
    for (const value of await statValues.all()) {
      const text = await value.textContent()
      expect(text).toMatch(/^\d[\d,]*$/)
    }
  })

  test('shows tenant name or "Dashboard" as the page heading', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    const text = await heading.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })
})

test.describe('dashboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('nav shows Overview, Users, Billing, Warranty Docs tabs', async ({ page }) => {
    await expect(page.locator('nav a[href="/dashboard"]')).toContainText('Overview')
    await expect(page.locator('nav a[href="/dashboard/users"]')).toContainText('Users')
    await expect(page.locator('nav a[href="/dashboard/billing"]')).toContainText('Billing')
    await expect(page.locator('nav a[href="/dashboard/docs"]')).toContainText('Warranty Docs')
  })

  test('clicking Users tab navigates to /dashboard/users', async ({ page }) => {
    await page.click('nav a[href="/dashboard/users"]')
    await expect(page).toHaveURL('/dashboard/users')
    await expect(page.locator('h1')).toContainText('Homeowners')
  })

  test('clicking Billing tab navigates to /dashboard/billing', async ({ page }) => {
    await page.click('nav a[href="/dashboard/billing"]')
    await expect(page).toHaveURL('/dashboard/billing')
    await expect(page.locator('h1')).toContainText('Billing')
  })

  test('clicking Warranty Docs tab navigates to /dashboard/docs', async ({ page }) => {
    await page.click('nav a[href="/dashboard/docs"]')
    await expect(page).toHaveURL('/dashboard/docs')
    await expect(page.locator('h1')).toContainText('Warranty Documents')
  })
})
