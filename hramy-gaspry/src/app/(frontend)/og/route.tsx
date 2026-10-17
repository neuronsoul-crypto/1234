import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { ImageResponse } from 'next/og'

const font = (pkg: string, file: string) => readFile(path.join(process.cwd(), 'node_modules', pkg, 'files', file))

/** Динамическая OG-картинка в стиле дизайн-системы: известняк, Cormorant, метка-путь, арка. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = (searchParams.get('title') || 'Храмы Гаспры').slice(0, 120)
  const pathLabel = (searchParams.get('path') || '/').slice(0, 60)

  const [cyr, lat, onestCyr, onestLat] = await Promise.all([
    font('@fontsource/cormorant-garamond', 'cormorant-garamond-cyrillic-600-normal.woff'),
    font('@fontsource/cormorant-garamond', 'cormorant-garamond-latin-600-normal.woff'),
    font('@fontsource/onest', 'onest-cyrillic-500-normal.woff'),
    font('@fontsource/onest', 'onest-latin-500-normal.woff'),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#F6F2EA',
          color: '#1C1A17',
          padding: '72px 80px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 820 }}>
          <div style={{ display: 'flex', fontFamily: 'Onest', fontSize: 28, color: '#5E5850', letterSpacing: 1 }}>
            {pathLabel}
          </div>
          <div style={{ display: 'flex', fontFamily: 'Cormorant', fontSize: title.length > 50 ? 72 : 92, lineHeight: 1.05 }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'Onest', fontSize: 28 }}>
            <div style={{ width: 48, height: 3, background: '#B08A3E' }} />
            Храмы Гаспры · Крым
          </div>
        </div>
        <svg width="300" height="300" viewBox="0 0 32 32" style={{ alignSelf: 'center' }} fill="none" stroke="#1C1A17" strokeWidth="0.7" strokeLinecap="round">
          <path d="M6 29V14a10 10 0 0 1 20 0v15" />
          <path d="M3.5 29h25" />
          <path d="M16 8v18" stroke="#B08A3E" />
          <path d="M9.5 15.6c2.4-1.7 4.4-2.6 6.5-2.6s4.1.9 6.5 2.6" stroke="#B08A3E" />
        </svg>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Cormorant', data: cyr, weight: 600, style: 'normal' },
        { name: 'Cormorant', data: lat, weight: 600, style: 'normal' },
        { name: 'Onest', data: onestCyr, weight: 500, style: 'normal' },
        { name: 'Onest', data: onestLat, weight: 500, style: 'normal' },
      ],
      headers: { 'Cache-Control': 'public, max-age=86400, immutable' },
    },
  )
}
