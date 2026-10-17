// Генерирует образцы фото для /styleguide и apple-touch-icon: npx tsx scripts/generate-static-assets.mts
import sharp from 'sharp'
import { placeholderSvg } from '../src/seed/placeholder'
const out = new URL('../public/styleguide', import.meta.url).pathname
for (const [i, [w, h]] of [[1200, 800], [800, 1000], [1200, 900]].entries()) {
  await sharp(Buffer.from(placeholderSvg(w, h, i))).webp({ quality: 70 }).toFile(`${out}/sample-${i + 1}.webp`)
}
// apple-touch-icon
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="180" height="180"><rect width="32" height="32" fill="#F6F2EA"/><g transform="translate(4 4) scale(.75)" fill="none" stroke="#1C1A17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 29V14a10 10 0 0 1 20 0v15"/><path d="M3.5 29h25"/><path d="M16 8v18"/><path d="M9.5 15.6c2.4-1.7 4.4-2.6 6.5-2.6s4.1.9 6.5 2.6"/></g></svg>`
await sharp(Buffer.from(icon)).png().toFile(new URL('../public/apple-touch-icon.png', import.meta.url).pathname)
