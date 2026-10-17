import Link from 'next/link'

import { formatLongDate, storedToKey } from '@/lib/dates'
import type { Album, Church, Media, Post } from '@/payload-types'

import { ChurchTag } from './ChurchTag'
import { Img } from './Img'

const CATEGORY: Record<string, string> = {
  obyavlenie: 'Объявление',
  sobytie: 'Событие',
  propoved: 'Проповедь',
  prihod: 'Приход',
}
export const categoryLabel = (c?: string | null) => CATEGORY[c ?? ''] ?? ''

const media = (m: number | Media | null | undefined) => (m && typeof m === 'object' ? m : undefined)
const church = (c: number | Church | null | undefined) => (c && typeof c === 'object' ? c : undefined)

export function NewsCard({ post, priority, level = 'h3' }: { post: Post; priority?: boolean; level?: 'h2' | 'h3' }) {
  const Heading = level
  const date = post.publishedAt ? formatLongDate(storedToKey(post.publishedAt)) : ''
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[3/2] overflow-hidden bg-surface">
        <Img media={media(post.cover)} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" priority={priority} />
      </div>
      <p className="mt-4 text-small text-ink-2">
        {date}
        {post.category ? <span> · {categoryLabel(post.category)}</span> : null}
      </p>
      <Heading className="mt-2 text-h3">
        <Link href={`/novosti/${post.slug}`} className="link-underline after:absolute after:inset-0">
          {post.title}
        </Link>
      </Heading>
      {post.lead ? <p className="mt-2 line-clamp-3 text-ink-2">{post.lead}</p> : null}
    </article>
  )
}

export function AlbumCard({ album, level = 'h3' }: { album: Album; level?: 'h2' | 'h3' }) {
  const Heading = level
  const cover = media(album.cover) ?? media(album.photos?.[0])
  const count = album.photos?.length ?? 0
  const c = church(album.church)
  return (
    <article className="group relative flex flex-col">
      <div className="arch relative aspect-[4/5] bg-surface">
        <Img media={cover} size="card" sizes="(min-width: 1024px) 300px, 50vw" />
      </div>
      <Heading className="mt-4 text-h3">
        <Link href={`/arhiv/${album.slug}`} className="link-underline after:absolute after:inset-0">
          {album.title}
        </Link>
      </Heading>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 text-small text-ink-2">
        <span>{formatLongDate(storedToKey(album.date))}</span>
        {c ? <ChurchTag color={c.color}>{c.shortName}</ChurchTag> : null}
        <span>{count} фото</span>
      </p>
    </article>
  )
}

export function ChurchCard({ church: c, priority }: { church: Church; priority?: boolean }) {
  const hero = media(c.heroImages?.[0])
  return (
    <article className="group relative flex flex-col">
      <div className="arch relative aspect-[4/5] bg-surface">
        <Img media={hero} size="card" sizes="(min-width: 768px) 50vw, 100vw" priority={priority} />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <ChurchTag color={c.color}>{c.shortName}</ChurchTag>
      </div>
      <h3 className="mt-2 font-display text-h2">
        <Link href={`/hramy/${c.slug}`} className="after:absolute after:inset-0">
          {c.name}
        </Link>
      </h3>
      {c.intro ? <p className="mt-3 line-clamp-2 text-ink-2 measure">{c.intro}</p> : null}
      <span className="path-label link-underline mt-4 self-start">/подробнее</span>
    </article>
  )
}
