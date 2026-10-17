import 'server-only'

import { draftMode } from 'next/headers'
import type { Where } from 'payload'
import { cache } from 'react'

import type { Album, Church, Clergy, Media, Page, Post, Sacrament, Service, Setting } from '@/payload-types'

import { addDays, storedToKey, todayKey } from './dates'
import { getPayloadClient } from './payload'
import type { ServiceItem } from './types'

export type { ServiceItem }


const isDraft = async () => {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

export const getSettings = cache(async (): Promise<Setting> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'settings', depth: 1 })
})

export const getChurches = cache(async (): Promise<Church[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'churches', sort: 'order', limit: 10, depth: 1 })
  return res.docs
})

export const getChurch = cache(async (slug: string): Promise<Church | undefined> => {
  const churches = await getChurches()
  return churches.find((c) => c.slug === slug)
})

export function toServiceItem(s: Service): ServiceItem | null {
  const church = typeof s.church === 'object' ? s.church : null
  if (!church) return null
  const celebrant = typeof s.celebrant === 'object' && s.celebrant ? `${s.celebrant.rank} ${s.celebrant.name}` : ''
  return {
    id: s.id,
    date: storedToKey(s.date),
    time: s.time,
    title: s.title ?? '',
    type: s.type ?? 'other',
    status: s.status ?? 'scheduled',
    feast: s.feast ?? '',
    feastRank: s.feastRank ?? 'none',
    note: s.note ?? '',
    celebrant,
    church: {
      id: church.id,
      slug: church.slug ?? '',
      shortName: church.shortName,
      name: church.name,
      color: church.color,
      address: church.address,
    },
  }
}

/** Опубликованные службы в диапазоне дат [from, to). */
export const getServices = cache(async (from: string, to: string): Promise<ServiceItem[]> => {
  const payload = await getPayloadClient()
  const where: Where = {
    and: [
      { published: { equals: true } },
      { date: { greater_than_equal: `${from}T00:00:00.000Z` } },
      { date: { less_than: `${to}T00:00:00.000Z` } },
    ],
  }
  const res = await payload.find({
    collection: 'services',
    where,
    sort: ['date', 'time'],
    limit: 1000,
    depth: 1,
    pagination: false,
  })
  return res.docs.map(toServiceItem).filter((s): s is ServiceItem => Boolean(s))
})

export const getUpcomingServices = (days: number) => {
  const today = todayKey()
  return getServices(today, addDays(today, days))
}

export const getPosts = cache(
  async (opts: { page?: number; limit?: number; category?: string; church?: number } = {}) => {
    const payload = await getPayloadClient()
    const and: Where[] = []
    if (opts.category) and.push({ category: { equals: opts.category } })
    if (opts.church) and.push({ church: { equals: opts.church } })
    return payload.find({
      collection: 'posts',
      where: and.length ? { and } : undefined,
      sort: '-publishedAt',
      page: opts.page ?? 1,
      limit: opts.limit ?? 9,
      depth: 1,
    })
  },
)

export const getPost = cache(async (slug: string): Promise<Post | undefined> => {
  const payload = await getPayloadClient()
  const draft = await isDraft()
  const res = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    draft,
    overrideAccess: draft,
  })
  return res.docs[0]
})

export const getAlbums = cache(
  async (opts: { page?: number; limit?: number; year?: number; church?: number; type?: string } = {}) => {
    const payload = await getPayloadClient()
    const and: Where[] = []
    if (opts.type) and.push({ type: { equals: opts.type } })
    if (opts.church) and.push({ church: { equals: opts.church } })
    if (opts.year) {
      and.push({ date: { greater_than_equal: `${opts.year}-01-01T00:00:00.000Z` } })
      and.push({ date: { less_than: `${opts.year + 1}-01-01T00:00:00.000Z` } })
    }
    return payload.find({
      collection: 'albums',
      where: and.length ? { and } : undefined,
      sort: '-date',
      page: opts.page ?? 1,
      limit: opts.limit ?? 12,
      depth: 1,
    })
  },
)

export const getAlbum = cache(async (slug: string): Promise<Album | undefined> => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'albums', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
  return res.docs[0]
})

export const getAlbumYears = cache(async (): Promise<number[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'albums', limit: 500, depth: 0, select: { date: true }, pagination: false })
  return [...new Set(res.docs.map((a) => Number(String(a.date).slice(0, 4))))].sort((a, b) => b - a)
})

export const getClergy = cache(async (): Promise<Clergy[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'clergy', sort: 'order', limit: 50, depth: 1 })
  return res.docs
})

export const getSacraments = cache(async (): Promise<Sacrament[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'sacraments', sort: 'order', limit: 50, depth: 0 })
  return res.docs
})

export const getSacrament = cache(async (slug: string) => {
  const list = await getSacraments()
  return list.find((s) => s.slug === slug)
})

export const getPage = cache(async (slug: string): Promise<Page | undefined> => {
  const payload = await getPayloadClient()
  const draft = await isDraft()
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    draft,
    overrideAccess: draft,
  })
  return res.docs[0]
})

export const asMedia = (value: number | Media | null | undefined): Media | undefined =>
  value && typeof value === 'object' ? value : undefined
