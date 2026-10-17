import Link from 'next/link'

import { HeroRotator, type HeroSlide } from '@/components/home/HeroRotator'
import { TodayBlock } from '@/components/home/TodayBlock'
import { WeekPreview } from '@/components/home/WeekPreview'
import { ButtonLink } from '@/components/ui/Button'
import { AlbumCard, ChurchCard, NewsCard } from '@/components/ui/Cards'
import { CampaignProgress, DonateBlock } from '@/components/ui/DonateBlock'
import { ImgPlaceholder } from '@/components/ui/Img'
import { JsonLd } from '@/components/ui/JsonLd'
import { MapBlock } from '@/components/ui/MapBlock'
import { PathLabel } from '@/components/ui/PathLabel'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { Reveal } from '@/components/ui/Reveal'
import { getAlbums, getChurches, getPosts, getServices, getSettings } from '@/lib/data'
import { addDays, displayTime, formatShortDate, nowTime, todayKey } from '@/lib/dates'
import { mediaList, toPhoto } from '@/lib/media'
import { churchJsonLd } from '@/lib/schema'
import { pageMeta } from '@/lib/seo'
import type { Media } from '@/payload-types'

export const revalidate = 600

export async function generateMetadata() {
  const settings = await getSettings()
  return {
    ...pageMeta({
      title: settings.siteName || 'Храмы Гаспры',
      path: '/',
      description:
        settings.metaDescription ||
        'Храм святой равноапостольной Нины и церковь иконы Божией Матери «Нерушимая Стена» в Гаспре: расписание богослужений, новости, таинства.',
    }),
    title: { absolute: `${settings.siteName || 'Храмы Гаспры'} — расписание богослужений, новости, таинства` },
  }
}

function SectionHead({ path, title, href, linkLabel }: { path: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div>
        <PathLabel>{path}</PathLabel>
        <h2 className="mt-3 text-h2">{title}</h2>
      </div>
      {href ? (
        <Link href={href} className="path-label link-underline self-start md:self-auto">
          {linkLabel ?? path}
        </Link>
      ) : null}
    </div>
  )
}

export default async function HomePage() {
  const today = todayKey()
  const [settings, churches, week, posts, albums] = await Promise.all([
    getSettings(),
    getChurches(),
    getServices(today, addDays(today, 14)),
    getPosts({ limit: 3 }),
    getAlbums({ limit: 1 }),
  ])

  const now = nowTime()
  const next = week.find((s) => s.status !== 'cancelled' && (s.date > today || s.time >= now))
  const nina = churches.find((c) => c.color === 'nina') ?? churches[0]
  const slides: HeroSlide[] = mediaList(nina?.heroImages)
    .slice(0, 5)
    .map((m: Media) => ({
      src: m.sizes?.hero?.url || m.url!,
      alt: m.alt || nina?.name || '',
      objectPosition: `${m.focalX ?? 50}% ${m.focalY ?? 50}%`,
    }))
  const latestAlbum = albums.docs[0]
  const stripPhotos = latestAlbum ? mediaList(latestAlbum.photos).slice(0, 8).map(toPhoto) : []
  const weekServices = week.filter((s) => s.date < addDays(today, 7))
  const chipChurches = churches.map((c) => ({ slug: c.slug ?? '', shortName: c.shortName, color: c.color }))

  return (
    <>
      <JsonLd data={churches.map(churchJsonLd)} />

      {/* 1. Hero */}
      <section className="relative -mt-px flex min-h-[calc(100svh-4.5rem)] items-end overflow-hidden bg-[#2a2620] text-[#f6f2ea]">
        {slides.length ? <HeroRotator slides={slides} /> : <ImgPlaceholder className="!bg-[#2a2620] !text-[#a69e90]" label="Здесь будет фото храма святой Нины" />}
        <div className="hero-shade absolute inset-0" aria-hidden />
        <div className="container-site relative pb-14 pt-32 md:pb-20">
          <p className="path-label !text-[#efe9dd]/80">/гаспра · крым</p>
          <h1 className="mt-4 max-w-[16ch] font-display text-display">{settings.siteName || 'Храмы Гаспры'}</h1>
          <p className="mt-4 max-w-[40ch] text-[1.25rem] text-[#efe9dd]/90">
            Храм святой равноапостольной Нины и церковь иконы Божией Матери «Нерушимая Стена»
          </p>
          {next ? (
            <Link
              href="/raspisanie"
              className="mt-10 inline-flex max-w-full flex-col gap-1 border-l-2 border-gold py-1 pl-5 no-underline hover:underline sm:flex-row sm:items-center sm:gap-2"
            >
              <span className="text-small uppercase tracking-[0.08em] text-gold-soft">Ближайшая служба:</span>
              <span className="text-[1.125rem]">
                {formatShortDate(next.date)} · {displayTime(next.time)} · {next.title} · {next.church.shortName}
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      {/* 2. Сегодня */}
      <Reveal as="section" className="section !border-t-0">
        <div className="container-site">
          <TodayBlock today={today} settings={settings} />
        </div>
      </Reveal>

      {/* 3. Расписание на неделю */}
      <Reveal as="section" className="section">
        <div className="container-site">
          <SectionHead path="/расписание" title="Богослужения на неделю" href="/raspisanie" linkLabel="/всё расписание" />
          <WeekPreview services={weekServices} churches={chipChurches} />
        </div>
      </Reveal>

      {/* 4. Два храма */}
      <Reveal as="section" className="section">
        <div className="container-site">
          <SectionHead path="/храмы" title="Два храма одного прихода" href="/hramy" linkLabel="/подробнее" />
          <div className="grid gap-16 md:grid-cols-2 md:gap-12">
            {churches.map((c) => (
              <ChurchCard key={c.id} church={c} />
            ))}
          </div>
        </div>
      </Reveal>

      {/* 5. Новости */}
      {posts.docs.length ? (
        <Reveal as="section" className="section">
          <div className="container-site">
            <SectionHead path="/новости" title="Новости и объявления" href="/novosti" linkLabel="/все новости" />
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.docs.map((p) => (
                <NewsCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}

      {/* 6. Из архива */}
      {latestAlbum ? (
        <Reveal as="section" className="section">
          <div className="container-site">
            <SectionHead path="/архив" title="Из фотоархива" href={`/arhiv/${latestAlbum.slug}`} linkLabel="/весь альбом" />
            <p className="-mt-6 mb-8 text-ink-2">{latestAlbum.title}</p>
            {stripPhotos.length ? (
              <PhotoGrid photos={stripPhotos} variant="strip" allowDownload={Boolean(latestAlbum.allowDownload)} />
            ) : (
              <div className="max-w-sm">
                <AlbumCard album={latestAlbum} />
              </div>
            )}
          </div>
        </Reveal>
      ) : null}

      {/* 7. Пожертвования */}
      <Reveal as="section" className="section">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <PathLabel>/пожертвования</PathLabel>
            <h2 className="mt-3 text-h2">Помочь приходу</h2>
            <p className="mt-5 text-ink-2 measure">
              Храм святой Нины — памятник архитектуры начала XX века. Ваши пожертвования идут на содержание обоих
              храмов, богослужение и реставрацию.
            </p>
            <div className="mt-8">
              <CampaignProgress settings={settings} />
            </div>
            <ButtonLink href="/pozhertvovaniya" className="mt-8">
              Как пожертвовать
            </ButtonLink>
          </div>
          <DonateBlock settings={settings} compact />
        </div>
      </Reveal>

      {/* 8. Как добраться */}
      <Reveal as="section" className="section">
        <div className="container-site">
          <SectionHead path="/как-добраться" title="Как нас найти" href="/palomnikam" linkLabel="/паломникам" />
          <MapBlock
            apiKey={process.env.YANDEX_MAPS_KEY}
            churches={churches.map((c) => ({
              id: c.id,
              name: c.name,
              shortName: c.shortName,
              address: c.address,
              color: c.color,
              lat: c.lat,
              lng: c.lng,
              orgId: c.yandexOrgId,
            }))}
          />
        </div>
      </Reveal>
    </>
  )
}
