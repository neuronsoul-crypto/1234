import sharp from 'sharp'

/**
 * Заглушки фотографий для демо-данных: условный крымский пейзаж
 * с силуэтом храма. Без текста — подписи хранятся в alt/caption.
 */
const PALETTES = [
  { sky: ['#EADBB8', '#F6F2EA'], sea: '#9FB4C4', hill: '#7A8C6E', stone: '#D9CDB4', ink: '#5E5850' },
  { sky: ['#C9D6DF', '#F2EEE6'], sea: '#6F8FA8', hill: '#5F7257', stone: '#E6DCC8', ink: '#4A453E' },
  { sky: ['#E9C99A', '#F3E3C8'], sea: '#A88E6A', hill: '#6E6A4F', stone: '#EFE3CC', ink: '#5A4A33' },
  { sky: ['#2E3A4A', '#5C6B7A'], sea: '#1F2B38', hill: '#2A3326', stone: '#B7AA92', ink: '#14130F' },
  { sky: ['#DCE3D5', '#F6F2EA'], sea: '#8DA5A0', hill: '#55684C', stone: '#E2DACB', ink: '#3C3A35' },
]

export function placeholderSvg(width: number, height: number, variant = 0, withChurch = true) {
  const p = PALETTES[variant % PALETTES.length]
  const h = height
  const w = width
  const horizon = h * 0.62
  const cx = w * (0.35 + (variant % 3) * 0.15)
  const s = Math.min(w, h) / 900
  const church = withChurch
    ? `<g transform="translate(${cx} ${horizon - 20 * s}) scale(${s})" fill="${p.stone}" stroke="${p.ink}" stroke-width="3">
        <rect x="-130" y="-170" width="260" height="190"/>
        <path d="M-130 -170 L0 -230 L130 -170Z"/>
        <rect x="-45" y="-330" width="90" height="120"/>
        <path d="M-55 -330 L0 -420 L55 -330Z"/>
        <path d="M0 -420 V-482 M-9 -470 H9 M-18 -457 H18 M-11 -434 L11 -442" fill="none" stroke-width="5"/>
        <path d="M-28 20 V-60 a28 28 0 0 1 56 0 V20" fill="${p.ink}" opacity=".55"/>
        <path d="M-95 -60 V-110 a14 14 0 0 1 28 0 V-60Z M67 -60 V-110 a14 14 0 0 1 28 0 V-60Z M-12 -250 V-290 a12 12 0 0 1 24 0 V-250Z" fill="${p.ink}" opacity=".45"/>
      </g>`
    : ''
  const cypress = (x: number, k: number) =>
    `<path d="M${x} ${horizon + 30} C${x - 14 * k} ${horizon - 40 * k}, ${x - 8 * k} ${horizon - 150 * k}, ${x} ${horizon - 190 * k} C${x + 8 * k} ${horizon - 150 * k}, ${x + 14 * k} ${horizon - 40 * k}, ${x} ${horizon + 30}Z" fill="${p.hill}" opacity=".9"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <path d="M0 ${horizon - h * 0.12} C${w * 0.25} ${horizon - h * 0.22}, ${w * 0.5} ${horizon - h * 0.05}, ${w} ${horizon - h * 0.18} V${horizon} H0Z" fill="${p.hill}" opacity=".35"/>
  <rect y="${horizon}" width="${w}" height="${h - horizon}" fill="${p.sea}" opacity=".55"/>
  <path d="M0 ${horizon + h * 0.08} C${w * 0.3} ${horizon + h * 0.02}, ${w * 0.6} ${horizon + h * 0.12}, ${w} ${horizon + h * 0.05} V${h} H0Z" fill="${p.hill}" opacity=".85"/>
  ${church}
  ${cypress(w * 0.12, s * 1.4)}${cypress(w * 0.18, s * 1.1)}${cypress(w * 0.86, s * 1.5)}${cypress(w * 0.92, s * 1.2)}
</svg>`
}

export async function placeholderJpeg(width: number, height: number, variant = 0, withChurch = true) {
  return sharp(Buffer.from(placeholderSvg(width, height, variant, withChurch))).jpeg({ quality: 80 }).toBuffer()
}
