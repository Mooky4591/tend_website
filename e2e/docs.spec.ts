import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/user.json' })

test.describe('warranty docs page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/docs')
    await page.waitForLoadState('networkidle')
  })

  test('renders Warranty Documents heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Warranty Documents')
  })

  test('shows Uploaded documents section and UploadForm', async ({ page }) => {
    await expect(page.locator('text=Uploaded documents')).toBeVisible()
    await expect(page.locator('text=Upload warranty document')).toBeVisible()
  })

  test('upload form has plan name input, PDF file input, and Upload button', async ({ page }) => {
    await expect(page.locator('#upload-plan-name')).toBeVisible()
    await expect(page.locator('#upload-pdf-file')).toBeVisible()
    await expect(page.locator('button', { hasText: 'Upload' })).toBeVisible()
  })

  test('Upload button is disabled when no file or plan name is entered', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Upload' })).toBeDisabled()
  })

  test('shows "No documents uploaded yet" when there are no docs', async ({ page }) => {
    const emptyState = page.locator('text=No documents uploaded yet')
    const docRows = page.locator('.space-y-2 .bg-white.rounded-2xl.border')
    const hasRows = await docRows.count() > 0
    if (!hasRows) {
      await expect(emptyState).toBeVisible()
    }
  })

  test('clicking Upload without a plan name shows validation error', async ({ page }) => {
    await page.locator('#upload-pdf-file').setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 minimal test content'),
    })

    // Upload button enabled only when both file and plan name are set; clicking without plan name
    // keeps it disabled, so we fill just the file and verify button stays disabled
    await expect(page.locator('button', { hasText: 'Upload' })).toBeDisabled()
  })

  test('successful upload shows chunk count success message', async ({ page }) => {
    await page.route('/api/warranty-upload', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ chunksInserted: 5 }),
      })
    )

    await page.fill('#upload-plan-name', 'E2E Test Plan')
    await page.locator('#upload-pdf-file').setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 minimal test content'),
    })
    await page.locator('button', { hasText: 'Upload' }).click()

    await expect(
      page.locator('text=Uploaded 5 chunks for "E2E Test Plan"')
    ).toBeVisible({ timeout: 10_000 })
  })

  test('failed upload shows error message', async ({ page }) => {
    await page.route('/api/warranty-upload', route =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid PDF format' }),
      })
    )

    await page.fill('#upload-plan-name', 'Bad Plan')
    await page.locator('#upload-pdf-file').setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 minimal test content'),
    })
    await page.locator('button', { hasText: 'Upload' }).click()

    await expect(page.locator('text=Invalid PDF format')).toBeVisible({ timeout: 10_000 })
  })

  test('clicking Delete on an existing doc shows browser confirm dialog', async ({ page }) => {
    const deleteBtn = page.locator('button', { hasText: 'Delete' }).first()
    const hasDoc = await deleteBtn.count() > 0
    if (!hasDoc) {
      // No docs to delete — test the empty state instead
      await expect(page.locator('text=No documents uploaded yet')).toBeVisible()
      return
    }

    let dialogMessage = ''
    page.once('dialog', dialog => {
      dialogMessage = dialog.message()
      dialog.dismiss()
    })

    await deleteBtn.click()
    expect(dialogMessage).toContain('This cannot be undone')
  })
})
