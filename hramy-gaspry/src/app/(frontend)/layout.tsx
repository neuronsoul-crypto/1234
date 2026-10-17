import '@fontsource-variable/onest/index.css'
import '@fontsource/cormorant-garamond/cyrillic-500.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/cyrillic-600.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/cormorant-garamond/cyrillic-500-italic.css'
import './styles.css'

import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { Banner } from '@/components/layout/Banner'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Metrika } from '@/components/layout/Metrika'
import { getChurches, getSettings } from '@/lib/data'
import { PREFS_SCRIPT } from '@/lib/prefs'
import { SITE_URL } from '@/lib/site'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: settings.siteName || 'Храмы Гаспры', template: `%s — ${settings.siteName || 'Храмы Гаспры'}` },
    description:
      settings.metaDescription ||
      'Храм святой равноапостольной Нины и церковь иконы Божией Матери «Нерушимая Стена» в Гаспре: расписание богослужений, новости, таинства, записки.',
    icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }], apple: '/apple-touch-icon.png' },
    formatDetection: { telephone: true },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F2EA' },
    { media: '(prefers-color-scheme: dark)', color: '#14130F' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const [settings, churches] = await Promise.all([getSettings(), getChurches()])
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        <Banner settings={settings} />
        <Header siteName={settings.siteName || 'Храмы Гаспры'} />
        <main id="main">{children}</main>
        <Footer settings={settings} churches={churches} />
        <Metrika id={process.env.YANDEX_METRIKA_ID} />
      </body>
    </html>
  )
}
