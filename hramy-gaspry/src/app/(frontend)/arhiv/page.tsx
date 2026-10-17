import { AlbumCard } from '@/components/ui/Cards'
import { FilterLinks, buildQuery } from '@/components/ui/FilterLinks'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { ALBUM_TYPES } from '@/lib/constants'
import { getAlbums, getAlbumYears, getChurches } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Фотоархив',
  description: 'Фотографии богослужений, праздников и приходской жизни, исторические снимки Гаспры и усадьбы Харакс.',
  path: '/arhiv',
})

type Props = { searchParams: Promise<{ god?: string; hram?: string; tip?: string; stranica?: string }> }

export default async function ArchivePage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.stranica) || 1)
  const [churches, years] = await Promise.all([getChurches(), getAlbumYears()])
  const church = churches.find((c) => c.slug === sp.hram)
  const year = years.includes(Number(sp.god)) ? Number(sp.god) : undefined
  const type = ALBUM_TYPES.some((t) => t.value === sp.tip) ? sp.tip : undefined
  const albums = await getAlbums({ page, limit: 12, year, church: church?.id, type })
  const href = (p: Partial<Record<'god' | 'hram' | 'tip', string>> & { stranica?: number }) =>
    buildQuery('/arhiv', { god: year ?? '', hram: church?.slug ?? '', tip: type ?? '', stranica: 1, ...p })

  return (
    <>
      <PageHeader
        path="/архив"
        title="Фотоархив"
        lead="Богослужения, праздники, жизнь прихода — и отдельный альбом исторических фотографий Гаспры и усадьбы Харакс."
        crumbs={[{ label: 'Архив' }]}
      />
      <div className="container-site">
        <div className="no-print flex flex-col gap-4 border-b border-line pb-6">
          <FilterLinks label="Тип" options={ALBUM_TYPES} current={type ?? ''} hrefFor={(v) => href({ tip: v })} />
          <FilterLinks
            label="Храм"
            options={churches.map((c) => ({ value: c.slug ?? '', label: c.shortName }))}
            current={church?.slug ?? ''}
            hrefFor={(v) => href({ hram: v })}
          />
          {years.length > 1 ? (
            <FilterLinks
              label="Год"
              options={years.map((y) => ({ value: String(y), label: String(y) }))}
              current={year ? String(year) : ''}
              hrefFor={(v) => href({ god: v })}
            />
          ) : null}
        </div>
        {albums.docs.length ? (
          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {albums.docs.map((a) => (
              <AlbumCard key={a.id} album={a} level="h2" />
            ))}
          </div>
        ) : (
          <p className="py-16 text-ink-2">Альбомов по выбранным условиям пока нет.</p>
        )}
        <Pagination page={page} totalPages={albums.totalPages} hrefFor={(p) => href({ stranica: p })} />
      </div>
    </>
  )
}
