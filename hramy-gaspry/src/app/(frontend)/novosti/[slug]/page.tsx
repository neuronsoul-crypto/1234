import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { LivePreviewListener } from '@/components/layout/LivePreviewListener'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { AlbumCard, NewsCard, categoryLabel } from '@/components/ui/Cards'
import { ChurchTag } from '@/components/ui/ChurchTag'
import { Img } from '@/components/ui/Img'
import { JsonLd } from '@/components/ui/JsonLd'
import { RichText } from '@/components/ui/RichText'
import { ShareButtons } from '@/components/ui/ShareButtons'
import { asMedia, getPost, getPosts } from '@/lib/data'
import { formatLongDate, storedToKey } from '@/lib/dates'
import { pageMeta } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 600

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await getPosts({ limit: 50 })
  return posts.docs.map((p) => ({ slug: p.slug ?? '' }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return pageMeta({
    title: post.title,
    description: post.lead ?? undefined,
    path: `/novosti/${slug}`,
    type: 'article',
    image: asMedia(post.cover)?.sizes?.card?.url ?? undefined,
  })
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const { isEnabled: draft } = await draftMode()

  const cover = asMedia(post.cover)
  const album = post.album && typeof post.album === 'object' ? post.album : null
  const church = post.church && typeof post.church === 'object' ? post.church : null
  const date = post.publishedAt ? formatLongDate(storedToKey(post.publishedAt)) : ''
  const more = (await getPosts({ limit: 4 })).docs.filter((p) => p.id !== post.id).slice(0, 3)
  const url = absoluteUrl(`/novosti/${post.slug}`)

  return (
    <article>
      {draft ? <LivePreviewListener /> : null}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: post.title,
          description: post.lead ?? undefined,
          datePublished: post.publishedAt ?? post.createdAt,
          dateModified: post.updatedAt,
          mainEntityOfPage: url,
          image: cover?.url ? [absoluteUrl(cover.url)] : undefined,
          publisher: { '@type': 'Organization', name: 'Приход храмов Гаспры' },
        }}
      />
      <div className="container-text pt-6">
        <Breadcrumbs items={[{ label: 'Новости', href: '/novosti' }, { label: post.title }]} />
        <p className="mt-12 flex flex-wrap items-center gap-x-4 text-small text-ink-2">
          <span>{date}</span>
          {post.category ? (
            <Link href={`/novosti?rubrika=${post.category}`} className="link-underline">
              {categoryLabel(post.category)}
            </Link>
          ) : null}
          {church ? <ChurchTag color={church.color}>{church.shortName}</ChurchTag> : null}
        </p>
        <h1 className="mt-4 font-display text-h1">{post.title}</h1>
        {post.lead ? <p className="mt-6 text-[1.3125rem] leading-relaxed text-ink-2">{post.lead}</p> : null}
      </div>
      {cover ? (
        <div className="container-site mt-12">
          <figure>
            <div className="relative aspect-[16/9] bg-surface">
              <Img media={cover} size="hero" sizes="(min-width: 1280px) 1280px, 100vw" priority />
            </div>
            {cover.caption ? <figcaption className="mt-2 text-small text-ink-2">{cover.caption}</figcaption> : null}
          </figure>
        </div>
      ) : null}
      <div className="container-text mt-12">
        <RichText data={post.content} />
        {album ? (
          <div className="mt-16 border-t border-line pt-10">
            <p className="path-label mb-6">/фотоальбом</p>
            <div className="max-w-sm">
              <AlbumCard album={album} />
            </div>
          </div>
        ) : null}
        <div className="mt-16 border-t border-line pt-8">
          <ShareButtons url={url} title={post.title} />
        </div>
      </div>
      {more.length ? (
        <section className="section mt-24">
          <div className="container-site">
            <h2 className="mb-12 text-h2">Другие новости</h2>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <NewsCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  )
}
