import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { LivePreviewListener } from '@/components/layout/LivePreviewListener'
import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { asMedia, getPage } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

import { PageBlocks } from './PageBlocks'

export async function cmsPageMeta(slug: string, fallbackTitle: string) {
  const page = await getPage(slug)
  return pageMeta({
    title: page?.title ?? fallbackTitle,
    description: page?.metaDescription ?? page?.lead ?? undefined,
    path: `/${slug}`,
  })
}

/** Страница из коллекции «Текстовые страницы» (блоки). */
export async function CmsPage({ slug, after, fallbackTitle }: { slug: string; after?: ReactNode; fallbackTitle?: string }) {
  const page = await getPage(slug)
  if (!page && !fallbackTitle) notFound()
  const { isEnabled: draft } = await draftMode()
  const cover = asMedia(page?.cover)
  return (
    <>
      {draft ? <LivePreviewListener /> : null}
      <PageHeader
        path={page?.pathLabel || `/${slug}`}
        title={page?.title ?? fallbackTitle ?? ''}
        lead={page?.lead}
        crumbs={[{ label: page?.title ?? fallbackTitle ?? '' }]}
      />
      {cover ? (
        <div className="container-site mb-8">
          <div className="relative aspect-[16/9] bg-surface">
            <Img media={cover} size="hero" sizes="100vw" priority />
          </div>
        </div>
      ) : null}
      <PageBlocks blocks={page?.layout} />
      {after}
    </>
  )
}
