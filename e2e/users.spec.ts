import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

test.use({ storageState: 'e2e/.auth/user.json' })

function getSeedState(): { aliceId: string } | null {
  const stateFile = path.join(__dirname, '.seed-state.json')
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'))
  } catch {
    return null
  }
}

test.describe('users list page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/users')
  })

  test('renders Homeowners heading with user count', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Homeowners')
    await expect(page.locator('text=/\\d+ total/')).toBeVisible()
  })

  test('table has Name, Phone, Location, Status columns', async ({ page }) => {
    await expect(page.locator('th', { hasText: 'Name' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Phone' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Location' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Status' })).toBeVisible()
  })

  test('shows either user rows with links or "No homeowners yet" empty state', async ({ page }) => {
    const userLinks = page.locator('table tbody a[href^="/dashboard/users/"]')
    const linkCount = await userLinks.count()
    if (linkCount > 0) {
      await expect(userLinks.first()).toBeVisible()
    } else {
      await expect(page.locator('text=No homeowners yet')).toBeVisible()
    }
  })

  test('clicking a user name navigates to their detail page', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.locator(`table tbody a[href="/dashboard/users/${userId}"]`).click()
    await expect(page).toHaveURL(/\/dashboard\/users\/.+/)
  })
})

test.describe('user detail page', () => {
  test('shows Conversation section, MessageForm, and RemindersPanel', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`)
    await expect(page.locator('h2', { hasText: 'Conversation' })).toBeVisible()
    await expect(page.locator('textarea[placeholder*="Type a message"]')).toBeVisible()
    await expect(page.locator('h2', { hasText: 'Scheduled Reminders' })).toBeVisible()
  })

  test('shows Back to homeowners link', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`)
    await expect(page.locator('a[href="/dashboard/users"]', { hasText: 'Back to homeowners' })).toBeVisible()
  })

  test('shows homeowner phone number', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`)
    // Phone number rendered in monospace font
    const phoneEl = page.locator('p.font-mono')
    await expect(phoneEl).toBeVisible()
  })
})

test.describe('message form', () => {
  test('Send button disabled when textarea is empty', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`, { waitUntil: 'networkidle' })
    await expect(page.locator('button', { hasText: 'Send' })).toBeDisabled()
  })

  test('Send button enabled after typing a message', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`, { waitUntil: 'networkidle' })
    await page.fill('textarea[placeholder*="Type a message"]', 'Hello from E2E test')
    await expect(page.locator('button', { hasText: 'Send' })).toBeEnabled()
  })

  test('clicking Send with mocked API clears the textarea', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`, { waitUntil: 'networkidle' })
    await page.route('/api/send-message', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    )

    const textarea = page.locator('textarea[placeholder*="Type a message"]')
    await textarea.fill('Hello from E2E test')
    await page.locator('button', { hasText: 'Send' }).click()

    // Textarea clears on success
    await expect(textarea).toHaveValue('', { timeout: 10_000 })
  })

  test('failed send shows error message', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`, { waitUntil: 'networkidle' })
    await page.route('/api/send-message', route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Twilio unavailable' }),
      })
    )

    await page.fill('textarea[placeholder*="Type a message"]', 'Test message')
    await page.locator('button', { hasText: 'Send' }).click()

    await expect(page.locator('text=Twilio unavailable')).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('reminders panel', () => {
  test('shows + Add button', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`, { waitUntil: 'networkidle' })
    await expect(page.locator('button', { hasText: '+ Add' })).toBeVisible()
  })

  test('clicking + Add shows the new reminder form with type select and date input', async ({
    page,
  }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`, { waitUntil: 'networkidle' })
    await page.locator('button', { hasText: '+ Add' }).click()
    await expect(page.locator('select').last()).toBeVisible()
    await expect(page.locator('input[type="date"]').last()).toBeVisible()
    await expect(page.locator('button', { hasText: /^Add$/ })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Cancel' })).toBeVisible()
  })

  test('clicking Cancel in the add form hides it', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`, { waitUntil: 'networkidle' })
    await page.locator('button', { hasText: '+ Add' }).click()
    await page.locator('button', { hasText: 'Cancel' }).click()
    // The add form's Add button should no longer be visible
    await expect(page.locator('button', { hasText: /^Add$/ })).not.toBeVisible()
  })

  test('clicking Add without a due date shows validation error', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`, { waitUntil: 'networkidle' })
    await page.locator('button', { hasText: '+ Add' }).click()
    await page.locator('button', { hasText: /^Add$/ }).click()
    await expect(page.locator('text=Due date is required')).toBeVisible()
  })

  test('full create-and-delete reminder flow hits real API', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`, { waitUntil: 'networkidle' })

    // Count all reminder cards BEFORE opening the form (form container shares these classes)
    const allCards = page.locator('.bg-white.border.border-slate-200.rounded-xl')
    const countBefore = await allCards.count()

    // Open the add form
    await page.locator('button', { hasText: '+ Add' }).click()

    // Select a reminder type (take the first option available)
    const typeSelect = page.locator('select').last()
    await typeSelect.selectOption({ index: 0 })

    // Set a unique future date so we can find this card specifically after creation
    await page.fill('input[type="date"]:last-of-type', '2099-12-31')

    // Submit
    await page.locator('button', { hasText: /^Add$/ }).click()

    // Wait for the add form to close (happens synchronously on success before router.refresh)
    await expect(page.locator('button', { hasText: 'Cancel' })).not.toBeVisible({ timeout: 10_000 })

    // Now wait for router.refresh() to bring in the new reminder card
    await expect(allCards).toHaveCount(countBefore + 1, { timeout: 10_000 })

    // Find the newly created card by its unique date; use .first() in case of leftover data
    const newCard = page.locator('.bg-white.border.border-slate-200.rounded-xl', { hasText: /Dec 31, 2099/ }).first()
    const deleteBtn = newCard.locator('button', { hasText: 'Delete' })
    // Wait for the router.refresh() transition to finish so Delete is enabled
    await expect(deleteBtn).toBeEnabled({ timeout: 10_000 })
    await deleteBtn.click()

    // Total count should return to what it was before
    await expect(allCards).toHaveCount(countBefore, { timeout: 10_000 })
  })

  test('edit reminder flow shows prefilled form and saves with mocked API', async ({ page }) => {
    const userId = getSeedState()?.aliceId ?? null
    if (!userId) {
      test.skip()
      return
    }
    await page.goto(`/dashboard/users/${userId}`, { waitUntil: 'networkidle' })

    // Scope to the reminders panel container to avoid matching the PhoneNumberEditor's
    // Edit button, which appears earlier in the DOM and shows an <input>, not a <select>.
    const remindersSection = page.locator('.bg-slate-50.rounded-2xl')
    const editBtn = remindersSection.locator('button', { hasText: 'Edit' }).first()
    if (await editBtn.count() === 0) {
      // No reminders to edit — skip
      test.skip()
      return
    }

    await page.route('/api/reminders/*', route => {
      if (route.request().method() === 'PATCH') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'r1', reminder_type: 'hvac_filter', due_date: '2099-06-01', sent: false }),
        })
      }
      return route.continue()
    })

    await editBtn.click()
    // Edit form should appear with a select and date input
    await expect(page.locator('select').last()).toBeVisible()
    await page.fill('input[type="date"]:last-of-type', '2099-06-01')
    await page.locator('button', { hasText: 'Save' }).click()

    // Edit form closes after save
    await expect(page.locator('button', { hasText: 'Save' })).not.toBeVisible({ timeout: 10_000 })
  })
})
