import { test, expect } from '@playwright/test'

test.describe('marketing homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders Sign in and Book a Demo links in header', async ({ page }) => {
    await expect(page.locator('header a[href="/login"]')).toBeVisible()
    await expect(page.locator('header a[href="#contact"]')).toContainText('Book a Demo')
  })

  test('desktop nav shows Features, How It Works, Pricing, FAQ anchor links', async ({ page }) => {
    await expect(page.locator('nav a[href="#features"]').first()).toBeVisible()
    await expect(page.locator('nav a[href="#how-it-works"]').first()).toBeVisible()
    await expect(page.locator('nav a[href="#pricing"]').first()).toBeVisible()
    await expect(page.locator('nav a[href="#faq"]').first()).toBeVisible()
  })

  test('mobile hamburger opens and closes the menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const hamburger = page.locator('[aria-label="Open navigation menu"]')
    await expect(hamburger).toBeVisible()

    await hamburger.click()
    await expect(page.locator('#mobile-menu')).toBeVisible()

    const closeBtn = page.locator('[aria-label="Close navigation menu"]')
    await closeBtn.click()
    await expect(page.locator('#mobile-menu')).not.toBeVisible()
  })

  test('mobile menu contains Sign in and Book a Demo links', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.click('[aria-label="Open navigation menu"]')
    const menu = page.locator('#mobile-menu')
    await expect(menu.locator('a[href="/login"]')).toBeVisible()
    await expect(menu.locator('a[href="#contact"]')).toContainText('Book a Demo')
  })

  test('Sign in link navigates to /login', async ({ page }) => {
    await page.click('header a[href="/login"]')
    await expect(page).toHaveURL('/login')
  })

  test('page has a main landmark with content sections', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('static pages', () => {
  test('/terms loads and shows a heading', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('/privacy-policy loads and shows a heading', async ({ page }) => {
    await page.goto('/privacy-policy')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('/sms-consent-proof loads and shows a heading', async ({ page }) => {
    await page.goto('/sms-consent-proof')
    await expect(page.locator('h1')).toBeVisible()
  })
})
