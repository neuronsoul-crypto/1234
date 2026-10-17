import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ChurchTag } from '@/components/ui/ChurchTag'
import { PageHeader } from '@/components/ui/PageHeader'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { ALBUM_TYPES } from '@/lib/constants'
import { asMedia, getAlbum, getAlbums } from '@/lib/data'
import { formatLongDate, storedToKey } from '@/lib/dates'
import { mediaList, toPhoto } from '@/lib/media'
import { pageMeta } from '@/lib/seo'

export const revalidate = 600

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const albums = await getAlbums({ limit: 50 })
  return albums.docs.map((a) => ({ slug: a.slug ?? '' }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const album = await getAlbum(slug)
  if (!album) return {}
  const cover = asMedia(album.cover) ?? mediaList(album.photos)[0]
  return pageMeta({
    title: album.title,
    description: album.description ?? undefined,
    path: `/arhiv/${slug}`,
    image: cover?.sizes?.card?.url ?? undefined,
  })
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params
  const album = await getAlbum(slug)
  if (!album) notFound()
  const photos = mediaList(album.photos).map(toPhoto)
  const church = album.church && typeof album.church === 'object' ? album.church : null
  const typeLabel = ALBUM_TYPES.find((t) => t.value === album.type)?.label

  return (
    <>
      <PageHeader
        path="/архив/альбом"
        title={album.title}
        lead={album.description}
        crumbs={[{ label: 'Архив', href: '/arhiv' }, { label: album.title }]}
      >
        <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-2">
          <span>{formatLongDate(storedToKey(album.date))}</span>
          {typeLabel ? <span>{typeLabel}</span> : null}
          {church ? <ChurchTag color={church.color}>{church.shortName}</ChurchTag> : null}
          <span>{photos.length} фото</span>
        </p>
      </PageHeader>
      <div className="container-site">
        {photos.length ? (
          <PhotoGrid photos={photos} allowDownload={Boolean(album.allowDownload)} />
        ) : (
          <p className="text-ink-2">Фотографии скоро появятся.</p>
        )}
      </div>
    </>
  )
}
