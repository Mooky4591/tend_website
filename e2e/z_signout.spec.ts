import { test, expect } from '@playwright/test'

// Sign-out test intentionally runs last (z_ prefix) and does NOT reuse the shared
// auth state, because Supabase's default global sign-out revokes the refresh token.
// A fresh login here creates a separate session that is then discarded.

test('sign out navigates to /login', async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD
  if (!email || !password) {
    test.skip()
    return
  }

  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard', { timeout: 20_000 })

  await page.click('button:has-text("Sign out")')
  await page.waitForURL('/login', { timeout: 10_000 })
  await expect(page).toHaveURL('/login')
})

test('after sign out, /dashboard redirects back to /login', async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD
  if (!email || !password) {
    test.skip()
    return
  }

  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard', { timeout: 20_000 })

  await page.click('button:has-text("Sign out")')
  await page.waitForURL('/login', { timeout: 10_000 })

  // Attempting to visit /dashboard now should redirect back to /login
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/login')
})
