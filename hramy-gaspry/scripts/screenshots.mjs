// Скриншоты страниц для проверки вёрстки: node scripts/screenshots.mjs [url-база] [папка]
import { chromium } from 'playwright'

const base = process.argv[2] || 'http://localhost:3000'
const out = process.argv[3] || 'screenshots'
const pages = (process.env.PAGES || '/,/raspisanie,/hramy/svyatoy-niny,/novosti,/arhiv/voskresnaya-liturgiya-demo,/zapiski,/styleguide').split(',')
const widths = (process.env.WIDTHS || '375,1440').split(',').map(Number)
const theme = process.env.THEME || 'light'

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined })
for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  for (const path of pages) {
    await page.goto(base + path, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible')))
    // прокрутка, чтобы подгрузились ленивые изображения
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(800)
    const name = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '_')
    await page.screenshot({ path: `${out}/${name}-${width}-${theme}.png`, fullPage: process.env.FULL !== '0' })
  }
  await ctx.close()
}
await browser.close()
