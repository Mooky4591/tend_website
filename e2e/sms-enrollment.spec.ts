import { test, expect } from '@playwright/test'

test.describe('SMS enrollment page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sms-enrollment')
  })

  test('renders all form fields', async ({ page }) => {
    await expect(page.locator('#full_name')).toBeVisible()
    await expect(page.locator('#phone')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#home_address')).toBeVisible()
    await expect(page.locator('#warranty_provider')).toBeVisible()
    await expect(page.locator('#system_or_appliance')).toBeVisible()
    await expect(page.locator('#sms_consent')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Enroll in Tendr SMS')
  })

  test('SMS consent checkbox is unchecked by default', async ({ page }) => {
    await expect(page.locator('#sms_consent')).not.toBeChecked()
  })

  test('submitting empty form shows required field errors', async ({ page }) => {
    await page.click('button[type="submit"]')
    await expect(page.locator('#full_name-error')).toContainText('Full name is required')
    await expect(page.locator('#phone-error')).toContainText('Mobile phone number is required')
    await expect(page.locator('#home_address-error')).toContainText('Home address is required')
    await expect(page.locator('#warranty_provider-error')).toContainText('Warranty provider is required')
  })

  test('invalid phone number shows phone format error', async ({ page }) => {
    await page.fill('#full_name', 'Jane Test')
    await page.fill('#phone', '123')
    await page.fill('#home_address', '123 Main St')
    await page.fill('#warranty_provider', 'Test Warranty Co')
    await page.click('button[type="submit"]')
    await expect(page.locator('#phone-error')).toContainText('valid phone number')
  })

  test('invalid email shows email format error', async ({ page }) => {
    await page.fill('#full_name', 'Jane Test')
    await page.fill('#phone', '5551234567')
    await page.fill('#email', 'notvalid')
    await page.fill('#home_address', '123 Main St')
    await page.fill('#warranty_provider', 'Test Warranty Co')
    await page.click('button[type="submit"]')
    await expect(page.locator('#email-error')).toContainText('valid email address')
  })

  test('successful submission with consent shows opted-in confirmation', async ({ page }) => {
    await page.route('/api/sms-enrollment', route =>
      route.fulfill({ status: 201, contentType: 'application/json', body: '{}' })
    )

    await page.fill('#full_name', 'Jane Test')
    await page.fill('#phone', '5551234567')
    await page.fill('#home_address', '123 Main St, Atlanta, GA 30301')
    await page.fill('#warranty_provider', 'Test Warranty Co')
    await page.check('#sms_consent')
    await page.click('button[type="submit"]')

    await expect(page.locator('[role="status"]')).toContainText('Enrollment submitted', { timeout: 10_000 })
    await expect(page.locator('[role="status"]')).toContainText('opted in to Tendr SMS')
  })

  test('successful submission without consent shows non-consent confirmation', async ({ page }) => {
    await page.route('/api/sms-enrollment', route =>
      route.fulfill({ status: 201, contentType: 'application/json', body: '{}' })
    )

    await page.fill('#full_name', 'Jane Test')
    await page.fill('#phone', '5551234567')
    await page.fill('#home_address', '123 Main St, Atlanta, GA 30301')
    await page.fill('#warranty_provider', 'Test Warranty Co')
    await page.click('button[type="submit"]')

    await expect(page.locator('[role="status"]')).toContainText('Enrollment submitted', { timeout: 10_000 })
    await expect(page.locator('[role="status"]')).toContainText('not opted in to SMS')
  })

  test('API error shows alert message', async ({ page }) => {
    await page.route('/api/sms-enrollment', route =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Phone number already enrolled' }),
      })
    )

    await page.fill('#full_name', 'Jane Test')
    await page.fill('#phone', '5551234567')
    await page.fill('#home_address', '123 Main St')
    await page.fill('#warranty_provider', 'Test Warranty Co')
    await page.click('button[type="submit"]')

    await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toContainText('Phone number already enrolled', {
      timeout: 10_000,
    })
  })
})
