import type { Metadata } from 'next'

import { absoluteUrl } from './site'

type Args = { title: string; description?: string; path: string; image?: string | null; type?: 'website' | 'article'; noindex?: boolean }

/** Метаданные страницы: канонический адрес, Open Graph с динамической картинкой в стиле сайта. */
export function pageMeta({ title, description, path, image, type = 'website', noindex }: Args): Metadata {
  const og = image ? absoluteUrl(image) : absoluteUrl(`/og?title=${encodeURIComponent(title)}&path=${encodeURIComponent(path)}`)
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type,
      locale: 'ru_RU',
      siteName: 'Храмы Гаспры',
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [og] },
    robots: noindex ? { index: false, follow: false } : undefined,
  }
}
