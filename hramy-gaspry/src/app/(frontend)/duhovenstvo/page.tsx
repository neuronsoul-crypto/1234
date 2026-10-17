import { Img } from '@/components/ui/Img'
import { PageHeader } from '@/components/ui/PageHeader'
import { asMedia, getClergy } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

export const revalidate = 600

export const metadata = pageMeta({ title: 'Духовенство', description: 'Священнослужители прихода храмов Гаспры.', path: '/duhovenstvo' })

export default async function ClergyPage() {
  const clergy = await getClergy()
  return (
    <>
      <PageHeader path="/духовенство" title="Духовенство" crumbs={[{ label: 'Духовенство' }]} />
      <div className="container-site">
        {clergy.length ? (
          <ul className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {clergy.map((c, i) => (
              <li key={c.id} className={i === 0 ? 'sm:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-[22rem_1fr] lg:gap-12' : ''}>
                <div className={`arch relative aspect-[4/5] bg-surface ${i === 0 ? 'max-w-[22rem]' : ''}`}>
                  <Img media={asMedia(c.photo)} sizes="(min-width: 1024px) 22rem, 50vw" />
                </div>
                <div className={i === 0 ? 'mt-6 lg:mt-0 lg:self-end' : 'mt-6'}>
                  {c.position ? <p className="path-label">/{c.position.toLowerCase()}</p> : null}
                  <h2 className={`mt-2 ${i === 0 ? 'text-h1' : 'text-h3 !text-[1.75rem]'}`}>
                    <span className="block text-[0.6em] font-medium text-ink-2">{c.rank}</span>
                    {c.name}
                  </h2>
                  <dl className="mt-4 space-y-1 text-small text-ink-2">
                    {c.ordinationDate ? (
                      <div>
                        <dt className="inline">Хиротония: </dt>
                        <dd className="inline">{c.ordinationDate}</dd>
                      </div>
                    ) : null}
                    {c.nameDay ? (
                      <div>
                        <dt className="inline">День тезоименитства: </dt>
                        <dd className="inline">{c.nameDay}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {c.bio ? <p className="mt-4 whitespace-pre-line measure">{c.bio}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-2">Сведения о духовенстве готовятся к публикации.</p>
        )}
      </div>
    </>
  )
}
