// PDF-версии инструкции и шпаргалки: node scripts/docs-pdf.mjs
import { readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { marked } from 'marked'
import { chromium } from 'playwright'

const docs = new URL('../docs/', import.meta.url).pathname
const fonts = new URL('../node_modules/', import.meta.url).href

const css = `
@font-face { font-family: Onest; src: url('${fonts}@fontsource-variable/onest/files/onest-cyrillic-wght-normal.woff2') format('woff2'); font-weight: 100 900; unicode-range: U+0400-045F, U+2116; }
@font-face { font-family: Onest; src: url('${fonts}@fontsource-variable/onest/files/onest-latin-wght-normal.woff2') format('woff2'); font-weight: 100 900; }
@font-face { font-family: Cormorant; src: url('${fonts}@fontsource/cormorant-garamond/files/cormorant-garamond-cyrillic-600-normal.woff2') format('woff2'); unicode-range: U+0400-045F; }
@font-face { font-family: Cormorant; src: url('${fonts}@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2') format('woff2'); }
@page { size: A4; margin: 16mm 14mm; }
body { font-family: Onest, sans-serif; font-size: 11pt; line-height: 1.5; color: #1C1A17; }
h1, h2 { font-family: Cormorant, serif; font-weight: 600; line-height: 1.1; }
h1 { font-size: 26pt; margin: 0 0 8pt; }
h2 { font-size: 18pt; margin: 18pt 0 6pt; break-after: avoid; }
hr { border: 0; border-top: 1px solid #E2DACB; margin: 14pt 0; }
img { max-width: 100%; border: 1px solid #E2DACB; margin: 6pt 0; break-inside: avoid; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0; break-inside: avoid; }
td, th { border-bottom: 1px solid #E2DACB; padding: 4pt 6pt; text-align: left; vertical-align: top; }
th { color: #5E5850; font-weight: 500; }
blockquote { margin: 8pt 0; padding: 4pt 10pt; border-left: 3px solid #B08A3E; background: #F6F2EA; }
code, pre { font-family: ui-monospace, monospace; font-size: 9.5pt; background: #F6F2EA; }
pre { padding: 8pt; white-space: pre-wrap; }
.compact { font-size: 9.6pt; } .compact h1 { font-size: 20pt; } .compact td { padding: 3pt 5pt; }
`

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined })
for (const [name, compact] of [['instrukciya-redaktora', false], ['shpargalka', true]]) {
  const md = await readFile(path.join(docs, `${name}.md`), 'utf8')
  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>${css}</style></head><body class="${compact ? 'compact' : ''}">${marked.parse(md)}</body></html>`
  // страница открывается как файл, чтобы подгрузились картинки и шрифты
  const tmp = path.join(docs, `.${name}.html`)
  await writeFile(tmp, html)
  const page = await browser.newPage()
  await page.goto(`file://${tmp}`, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.pdf({ path: path.join(docs, `${name}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true })
  await page.close()
  await rm(tmp)
}
await browser.close()
