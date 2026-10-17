import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ButtonLink } from '@/components/ui/Button'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { AlbumCard } from '@/components/ui/Cards'
import { ChurchTag } from '@/components/ui/ChurchTag'
import { DayGroup } from '@/components/ui/DayGroup'
import { Img } from '@/components/ui/Img'
import { JsonLd } from '@/components/ui/JsonLd'
import { MapBlock } from '@/components/ui/MapBlock'
import { Ornament } from '@/components/ui/Ornament'
import { PathLabel } from '@/components/ui/PathLabel'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { RichText } from '@/components/ui/RichText'
import { ServiceRow } from '@/components/ui/ServiceRow'
import { Timeline } from '@/components/ui/Timeline'
import { asMedia, getAlbums, getChurch, getChurches, getServices } from '@/lib/data'
import { addDays, todayKey } from '@/lib/dates'
import { mediaList, toPhoto } from '@/lib/media'
import { churchJsonLd } from '@/lib/schema'
import { groupByDay } from '@/lib/schedule'
import { pageMeta } from '@/lib/seo'
import type { Church } from '@/payload-types'

export const revalidate = 600

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const churches = await getChurches()
  return churches.map((c) => ({ slug: c.slug ?? '' }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const church = await getChurch(slug)
  if (!church) return {}
  const hero = asMedia(church.heroImages?.[0])
  return pageMeta({
    title: church.name,
    description: church.intro ?? undefined,
    path: `/hramy/${slug}`,
    image: hero?.sizes?.card?.url ?? undefined,
  })
}

type HistoryBlock = NonNullable<Church['history']>[number]

/** Подряд идущие события хронологии объединяем в одну ленту. */
function groupHistory(blocks: HistoryBlock[]) {
  const out: Array<{ kind: 'timeline'; items: Extract<HistoryBlock, { blockType: 'timelineItem' }>[] } | { kind: 'block'; block: HistoryBlock }> = []
  for (const b of blocks) {
    if (b.blockType === 'timelineItem') {
      const last = out[out.length - 1]
      if (last?.kind === 'timeline') last.items.push(b)
      else out.push({ kind: 'timeline', items: [b] })
    } else out.push({ kind: 'block', block: b })
  }
  return out
}

function Section({ path, title, children, id }: { path: string; title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="section">
      <div className="container-site grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-16">
        <div>
          <PathLabel>{path}</PathLabel>
          <h2 className="mt-3 text-h2">{title}</h2>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

export default async function ChurchPage({ params }: Props) {
  const { slug } = await params
  const church = await getChurch(slug)
  if (!church) notFound()

  const today = todayKey()
  const [services, albums] = await Promise.all([
    getServices(today, addDays(today, 7)),
    getAlbums({ church: church.id, limit: 3 }),
  ])
  const ownServices = services.filter((s) => s.church.id === church.id)
  const heroes = mediaList(church.heroImages)
  const history = groupHistory(church.history ?? [])
  const extra = church.extraSection

  return (
    <>
      <JsonLd data={churchJsonLd(church)} />
      <div className="container-site pt-6">
        <Breadcrumbs items={[{ label: 'Храмы', href: '/hramy' }, { label: church.shortName }]} />
      </div>

      {/* hero + краткая справка */}
      <div className="container-site mb-24 mt-10 grid gap-12 md:mt-16 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
        <div>
          <ChurchTag color={church.color}>{church.shortName}</ChurchTag>
          <h1 className="mt-4 font-display text-h1">{church.name}</h1>
          {church.intro ? <p className="mt-6 text-[1.25rem] leading-relaxed text-ink-2 measure">{church.intro}</p> : null}
          {church.facts?.length ? (
            <dl className="mt-10 divide-y divide-line border-y border-line">
              {church.facts.map((f) => (
                <div key={f.id} className="grid grid-cols-[10rem_1fr] gap-4 py-3">
                  <dt className="text-ink-2">{f.label}</dt>
                  <dd className="font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={`/raspisanie?hram=${church.slug}`}>Расписание служб</ButtonLink>
            <ButtonLink href="#kak-proyti" variant="secondary">
              Как пройти
            </ButtonLink>
          </div>
        </div>
        <div className="arch relative aspect-[4/5] w-full bg-surface lg:max-w-[34rem] lg:justify-self-end">
          <Img media={heroes[0]} size="hero" sizes="(min-width: 1024px) 34rem, 100vw" priority />
        </div>
      </div>

      {history.length ? (
        <Section path="/история" title="История">
          <div className="space-y-12">
            {history.map((h, i) =>
              h.kind === 'timeline' ? (
                <Timeline key={i} items={h.items} />
              ) : h.block.blockType === 'richText' ? (
                <RichText key={i} data={h.block.body} />
              ) : h.block.blockType === 'gallery' ? (
                <PhotoGrid key={i} photos={mediaList(h.block.images).map(toPhoto)} />
              ) : null,
            )}
          </div>
        </Section>
      ) : null}

      {church.architecture ? (
        <Section path="/архитектура" title="Архитектура">
          <RichText data={church.architecture} />
        </Section>
      ) : null}

      {extra?.heading ? (
        <Section path="/икона" title={extra.heading}>
          <div className="grid gap-10 xl:grid-cols-[1fr_16rem]">
            <RichText data={extra.body} />
            {asMedia(extra.image) ? (
              <div className="arch relative aspect-[3/4] bg-surface">
                <Img media={asMedia(extra.image)} sizes="16rem" />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {church.shrines?.length ? (
        <Section path="/святыни" title="Святыни">
          <ul className="grid gap-10 sm:grid-cols-2">
            {church.shrines.map((s) => (
              <li key={s.id}>
                <div className="relative aspect-[4/3] bg-surface">
                  <Img media={asMedia(s.image)} sizes="(min-width: 640px) 40vw, 100vw" />
                </div>
                <h3 className="mt-4 text-h3">{s.title}</h3>
                {s.text ? <p className="mt-2 text-ink-2">{s.text}</p> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {church.patronalFeasts?.length ? (
        <Section path="/престольный-праздник" title="Престольный праздник">
          <ul className="space-y-6">
            {church.patronalFeasts.map((f) => (
              <li key={f.id} className="border-l-2 border-gold pl-6">
                <p className="font-display text-[2rem] font-semibold leading-tight text-gold-ink">{f.date}</p>
                <p className="mt-1 text-[1.125rem] font-medium">{f.title}</p>
                {f.note ? <p className="mt-1 text-ink-2">{f.note}</p> : null}
              </li>
            ))}
          </ul>
          <Link href={`/raspisanie?hram=${church.slug}&vid=month`} className="path-label link-underline mt-8 inline-block">
            /службы-в-храме
          </Link>
        </Section>
      ) : null}

      <Section path="/ближайшие-службы" title="Ближайшие службы">
        {ownServices.length ? (
          groupByDay(ownServices).map(([date, list]) => (
            <DayGroup key={date} date={date} today={today} level="h3">
              {list.map((s) => (
                <ServiceRow key={s.id} service={s} showChurch={false} />
              ))}
            </DayGroup>
          ))
        ) : (
          <p className="text-ink-2">На ближайшую неделю службы в этом храме ещё не внесены.</p>
        )}
      </Section>

      {albums.docs.length ? (
        <Section path="/фото" title="Фото из архива">
          <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
            {albums.docs.map((a) => (
              <AlbumCard key={a.id} album={a} />
            ))}
          </div>
        </Section>
      ) : null}

      <Section path="/как-пройти" title="Как пройти" id="kak-proyti">
        <div className="space-y-8">
          <p className="text-[1.125rem] font-medium">{church.address}</p>
          {church.openingHours ? <p className="whitespace-pre-line text-ink-2">{church.openingHours}</p> : null}
          {church.howToGet ? <RichText data={church.howToGet} /> : null}
          <MapBlock
            apiKey={process.env.YANDEX_MAPS_KEY}
            churches={[
              {
                id: church.id,
                name: church.name,
                shortName: church.shortName,
                address: church.address,
                color: church.color,
                lat: church.lat,
                lng: church.lng,
                orgId: church.yandexOrgId,
              },
            ]}
          />
        </div>
      </Section>
      <div className="container-site mt-24">
        <Ornament />
      </div>
    </>
  )
}
