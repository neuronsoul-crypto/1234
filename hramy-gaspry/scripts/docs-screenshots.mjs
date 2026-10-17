// Скриншоты админки для инструкции редактора: node scripts/docs-screenshots.mjs
// Нужен запущенный сайт с демо-данными (npm run dev + npm run seed).
import { chromium } from 'playwright'
import sharp from 'sharp'

const base = process.env.BASE || 'http://localhost:3000'
const out = new URL('../docs/img/', import.meta.url).pathname
const password = process.env.SEED_ADMIN_PASSWORD || 'demo-gaspra-2026'

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 })
const page = await ctx.newPage()
await page.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
await page.screenshot({ path: `${out}raw.png` })
await shot('01-vhod')
await page.fill('input[name="email"]', 'admin@example.ru')
await page.fill('input[name="password"]', password)
await page.click('button[type="submit"]')
await page.waitForURL('**/admin')
await page.waitForLoadState('networkidle')

async function shot(name, opts = {}) {
  await page.waitForTimeout(600)
  const buf = await page.screenshot({ fullPage: opts.full ?? false, clip: opts.clip })
  await sharp(buf).resize({ width: 1100 }).png({ compressionLevel: 9, palette: true }).toFile(`${out}${name}.png`)
}

await shot('02-glavnyy-ekran')
await page.locator('.hg-week').scrollIntoViewIfNeeded()
await shot('03-raspisanie-nedeli')

await page.goto(`${base}/admin/raspisanie-tekstom`, { waitUntil: 'networkidle' })
await page.fill('textarea', 'Суббота, 7 ноября\n9:00 Божественная литургия (Нерушимая Стена)\n17:00 Всенощное бдение (Стена)\n8 ноя, вс — 9:00 Божественная литургия (Нины)')
await page.click('text=Разобрать и показать')
await page.waitForSelector('.hg-import__table')
await shot('04-vstavit-tekstom', { full: true })

await page.goto(`${base}/admin/collections/services/create`, { waitUntil: 'networkidle' })
await shot('05-novaya-sluzhba')

await page.goto(`${base}/admin/collections/posts/create`, { waitUntil: 'networkidle' })
await shot('06-novaya-novost')

await page.goto(`${base}/admin/collections/albums/create`, { waitUntil: 'networkidle' })
await shot('07-novyy-albom')

await page.goto(`${base}/admin/collections/requests`, { waitUntil: 'networkidle' })
await shot('08-zayavki')

await page.goto(`${base}/admin/globals/settings`, { waitUntil: 'networkidle' })
await shot('09-nastroyki')

await page.goto(`${base}/admin/collections/pages`, { waitUntil: 'networkidle' })
await shot('10-stranitsy')

await browser.close()
