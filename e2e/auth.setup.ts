import { test as setup, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const authFile = 'e2e/.auth/user.json'

setup('authenticate as test user', async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD
  if (!email || !password) {
    throw new Error(
      'E2E_TEST_EMAIL and E2E_TEST_PASSWORD environment variables must be set to run E2E tests'
    )
  }

  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  await page.goto('/login')
  await expect(page.locator('#email')).toBeVisible()
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard', { timeout: 20_000 })
  await expect(page).toHaveURL('/dashboard')

  await page.context().storageState({ path: authFile })
})
