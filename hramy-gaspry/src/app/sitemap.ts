import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 3600

const STATIC = ['/', '/raspisanie', '/hramy', '/novosti', '/arhiv', '/duhovenstvo', '/tainstva', '/zapiski', '/pozhertvovaniya', '/kontakty']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const [churches, posts, albums, sacraments, pages] = await Promise.all([
    payload.find({ collection: 'churches', limit: 20, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'posts', limit: 1000, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'albums', limit: 1000, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'sacraments', limit: 50, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'pages', limit: 100, depth: 0, select: { slug: true, updatedAt: true } }),
  ])
  return [
    ...STATIC.map((p) => ({
      url: absoluteUrl(p),
      changeFrequency: (p === '/raspisanie' ? 'daily' : 'weekly') as 'daily' | 'weekly',
      priority: p === '/' ? 1 : p === '/raspisanie' ? 0.9 : 0.7,
    })),
    ...churches.docs.map((d) => ({ url: absoluteUrl(`/hramy/${d.slug}`), lastModified: d.updatedAt, priority: 0.8 })),
    ...posts.docs.map((d) => ({ url: absoluteUrl(`/novosti/${d.slug}`), lastModified: d.updatedAt })),
    ...albums.docs.map((d) => ({ url: absoluteUrl(`/arhiv/${d.slug}`), lastModified: d.updatedAt })),
    ...sacraments.docs.map((d) => ({ url: absoluteUrl(`/tainstva/${d.slug}`), lastModified: d.updatedAt })),
    ...pages.docs.map((d) => ({ url: absoluteUrl(`/${d.slug}`), lastModified: d.updatedAt })),
  ]
}
