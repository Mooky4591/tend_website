import { test, expect } from '@playwright/test'

test.describe('auth guard', () => {
  test('unauthenticated visit to /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('unauthenticated visit to /dashboard/users redirects to /login', async ({ page }) => {
    await page.goto('/dashboard/users')
    await expect(page).toHaveURL('/login')
  })

  test('unauthenticated visit to /dashboard/docs redirects to /login', async ({ page }) => {
    await page.goto('/dashboard/docs')
    await expect(page).toHaveURL('/login')
  })

  test('unauthenticated visit to /dashboard/billing redirects to /login', async ({ page }) => {
    await page.goto('/dashboard/billing')
    await expect(page).toHaveURL('/login')
  })
})

test.describe('login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('renders email and password fields with sign in button', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign in')
  })

  test('shows Forgot password link', async ({ page }) => {
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible()
  })

  test('shows error alert when submitting wrong credentials', async ({ page }) => {
    await page.fill('#email', 'nobody@example.com')
    await page.fill('#password', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toBeVisible({ timeout: 10_000 })
  })

  test('shows expired-link error for auth_callback_failed query param', async ({ page }) => {
    await page.goto('/login?error=auth_callback_failed')
    await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toContainText('expired or is invalid')
  })
})

test.describe('forgot password page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password')
  })

  test('renders email input and Send reset link button', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toHaveText('Send reset link')
  })

  test('shows Back to sign in link', async ({ page }) => {
    await expect(page.locator('a[href="/login"]')).toBeVisible()
  })

  test('submitting any email shows success message', async ({ page }) => {
    await page.fill('#email', 'anyone@example.com')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=If that email is registered')).toBeVisible({ timeout: 10_000 })
  })

  test('success screen shows Back to sign in link', async ({ page }) => {
    await page.fill('#email', 'anyone@example.com')
    await page.click('button[type="submit"]')
    await expect(page.locator('a[href="/login"]')).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('reset password page', () => {
  test('renders new password field and Update password button', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toHaveText('Update password')
  })

  test('shows Back to sign in link', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(page.locator('a[href="/login"]')).toBeVisible()
  })
})
