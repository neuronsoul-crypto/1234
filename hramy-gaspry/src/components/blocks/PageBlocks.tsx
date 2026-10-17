import Link from 'next/link'

import { Img } from '@/components/ui/Img'
import { MapBlock } from '@/components/ui/MapBlock'
import { PathLabel } from '@/components/ui/PathLabel'
import { RichText } from '@/components/ui/RichText'
import { getChurches, getSettings } from '@/lib/data'
import type { Media, Page } from '@/payload-types'

type Block = NonNullable<Page['layout']>[number]

async function ContactsBlock({ note }: { note?: string | null }) {
  const [settings, churches] = await Promise.all([getSettings(), getChurches()])
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div>
        <h3 className="text-h3">Телефоны</h3>
        <ul className="mt-3 space-y-2">
          {(settings.phones ?? []).map((p) => (
            <li key={p.id}>
              <a href={`tel:${p.number.replace(/[^\d+]/g, '')}`} className="tap inline-flex items-center text-[1.25rem] font-medium link-underline">
                {p.number}
              </a>
              {p.label ? <span className="ml-2 text-ink-2">{p.label}</span> : null}
            </li>
          ))}
          {settings.email ? (
            <li>
              <a href={`mailto:${settings.email}`} className="link-underline">
                {settings.email}
              </a>
            </li>
          ) : null}
        </ul>
        {note ? <p className="mt-3 text-ink-2">{note}</p> : null}
      </div>
      <div>
        <h3 className="text-h3">Адреса</h3>
        <ul className="mt-3 space-y-3">
          {churches.map((c) => (
            <li key={c.id}>
              <span className="font-medium">{c.name}</span>
              <br />
              <span className="text-ink-2">{c.address}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

async function MapSectionBlock() {
  const churches = await getChurches()
  return (
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
  )
}

function Heading({ heading, path }: { heading?: string | null; path?: string | null }) {
  if (!heading && !path) return null
  return (
    <div className="mb-8">
      {path ? <PathLabel>{path}</PathLabel> : null}
      {heading ? <h2 className="mt-2 text-h2">{heading}</h2> : null}
    </div>
  )
}

export function PageBlocks({ blocks }: { blocks?: Block[] | null }) {
  if (!blocks?.length) return null
  return (
    <div>
      {blocks.map((b, index) => {
        const key = b.id ?? String(index)
        switch (b.blockType) {
          case 'text':
            return (
              <section key={key} className="container-text py-10">
                <Heading heading={b.heading} path={b.pathLabel} />
                <RichText data={b.body} />
              </section>
            )
          case 'cards':
            return (
              <section key={key} className="container-site py-12">
                <Heading heading={b.heading} />
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {(b.items ?? []).map((it) => (
                    <li key={it.id} className="group relative border border-line bg-surface p-6">
                      <h3 className="text-h3">
                        {it.link ? (
                          <Link href={it.link} className="link-underline after:absolute after:inset-0">
                            {it.title}
                          </Link>
                        ) : (
                          it.title
                        )}
                      </h3>
                      {it.text ? <p className="mt-3 whitespace-pre-line text-ink-2">{it.text}</p> : null}
                    </li>
                  ))}
                </ul>
              </section>
            )
          case 'steps':
            return (
              <section key={key} className="container-text py-10">
                <Heading heading={b.heading} />
                <ol className="space-y-8">
                  {(b.items ?? []).map((it, i) => (
                    <li key={it.id} className="grid grid-cols-[3rem_1fr] gap-4">
                      <span className="font-display text-[2.25rem] font-semibold leading-none text-gold-ink">{i + 1}</span>
                      <div>
                        <h3 className="text-h3">{it.title}</h3>
                        {it.text ? <p className="mt-2 whitespace-pre-line text-ink-2">{it.text}</p> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )
          case 'faq':
            return (
              <section key={key} className="container-text py-10">
                <Heading heading={b.heading} />
                <div className="divide-y divide-line border-y border-line">
                  {(b.items ?? []).map((it) => (
                    <details key={it.id} className="group py-2">
                      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-[1.125rem] font-medium">
                        {it.question}
                        <span aria-hidden className="text-gold-ink transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="pb-4 whitespace-pre-line text-ink-2 measure">{it.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )
          case 'callout':
            return (
              <section key={key} className="container-text py-8">
                <p
                  className={`border-l-2 bg-surface p-6 text-[1.125rem] whitespace-pre-line ${b.tone === 'lazur' ? 'border-lazur' : 'border-gold'}`}
                >
                  {b.text}
                </p>
              </section>
            )
          case 'image': {
            const m = typeof b.image === 'object' ? (b.image as Media) : undefined
            return (
              <figure key={key} className="container-site py-10">
                <div className="relative aspect-[16/9] bg-surface">
                  <Img media={m} size="hero" sizes="(min-width: 1280px) 1280px, 100vw" />
                </div>
                {b.caption ? <figcaption className="mt-2 text-small text-ink-2">{b.caption}</figcaption> : null}
              </figure>
            )
          }
          case 'contacts':
            return (
              <section key={key} className="container-text py-10">
                <ContactsBlock note={b.note} />
              </section>
            )
          case 'map':
            return (
              <section key={key} className="container-site py-12">
                <Heading heading={b.heading} />
                <MapSectionBlock />
              </section>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
