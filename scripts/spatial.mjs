import { chromium, expect } from '@playwright/test'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
try {
  await page.goto('http://127.0.0.1:3001')
  await page.getByLabel('Investigation team').fill('Spatial QA')
  await page.getByRole('button', { name: 'Enter facility' }).click()
  await expect(page.locator('canvas')).toBeVisible()
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: 'Enter exploration' }).click()
  await page.waitForFunction(() => !!document.pointerLockElement)
  await page.keyboard.down('KeyW'); await page.waitForTimeout(850); await page.keyboard.up('KeyW')
  // Real controller receives relative mouse movement while the browser owns pointer lock.
  await page.evaluate(() => window.dispatchEvent(new MouseEvent('mousemove', { movementY: 205 })))
  await expect(page.locator('.interaction')).toContainText('Read handover')
  await page.keyboard.press('KeyE')
  await expect(page.getByRole('heading', { name: 'Unfinished handover' })).toBeVisible()
  await expect(page.getByText('Evidence preserved in your case file.', { exact: false })).toBeVisible()
  await page.screenshot({ path: 'test-results/inspection.png' })
  console.log('PASS: pointer lock → WASD movement → mouse look → raycast prompt → E inspect → server-preserved handover.')
} finally { await browser.close() }
