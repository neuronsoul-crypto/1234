import { NewsCard } from '@/components/ui/Cards'
import { FilterLinks, buildQuery } from '@/components/ui/FilterLinks'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { POST_CATEGORIES } from '@/lib/constants'
import { getChurches, getPosts } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Новости и объявления',
  description: 'Новости, объявления и события прихода храмов Гаспры.',
  path: '/novosti',
})

type Props = { searchParams: Promise<{ rubrika?: string; hram?: string; stranica?: string }> }

export default async function NewsPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.stranica) || 1)
  const category = POST_CATEGORIES.some((c) => c.value === sp.rubrika) ? sp.rubrika : ''
  const churches = await getChurches()
  const church = churches.find((c) => c.slug === sp.hram)
  const posts = await getPosts({ page, limit: 9, category: category || undefined, church: church?.id })
  const href = (p: Partial<{ rubrika: string; hram: string; stranica: number }>) =>
    buildQuery('/novosti', { rubrika: category, hram: church?.slug ?? '', stranica: 1, ...p })

  return (
    <>
      <PageHeader path="/новости" title="Новости и объявления" crumbs={[{ label: 'Новости' }]} />
      <div className="container-site">
        <div className="no-print flex flex-col gap-4 border-b border-line pb-6">
          <FilterLinks label="Рубрика" options={POST_CATEGORIES} current={category ?? ''} hrefFor={(v) => href({ rubrika: v })} />
          <FilterLinks
            label="Храм"
            options={churches.map((c) => ({ value: c.slug ?? '', label: c.shortName }))}
            current={church?.slug ?? ''}
            hrefFor={(v) => href({ hram: v })}
          />
        </div>
        {posts.docs.length ? (
          <div className="mt-12 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {posts.docs.map((p, i) => (
              <NewsCard key={p.id} post={p} priority={i < 3} level="h2" />
            ))}
          </div>
        ) : (
          <p className="py-16 text-ink-2">Новостей по выбранным условиям пока нет.</p>
        )}
        <Pagination page={page} totalPages={posts.totalPages} hrefFor={(p) => href({ stranica: p })} />
      </div>
    </>
  )
}
