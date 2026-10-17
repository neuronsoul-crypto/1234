import Link from 'next/link'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { PrintButton } from '@/components/ui/PrintButton'
import { hasRole } from '@/access/roles'
import { formatStamp } from '@/lib/dates'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Печать записок', robots: { index: false, follow: false } }

type Details = { тип?: string; поминовение?: string; имена?: string[] }

/** Печатный лист записок для проскомидии: только для администраторов и духовенства. */
export default async function PrintZapiski({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!hasRole(user, 'admin', 'clergy')) {
    return (
      <div className="container-text py-24">
        <h1 className="text-h2">Нет доступа</h1>
        <p className="mt-4">
          Войдите в <Link href="/admin" className="text-lazur underline">админку</Link> под учётной записью администратора или
          священника.
        </p>
      </div>
    )
  }
  const res = await payload.find({
    collection: 'requests',
    where: id && /^\d+$/.test(id) ? { id: { equals: Number(id) } } : { and: [{ type: { equals: 'zapiska' } }, { status: { equals: 'new' } }] },
    sort: 'createdAt',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  const groups = new Map<string, { names: string[]; count: number }>()
  for (const r of res.docs) {
    const d = (r.details ?? {}) as Details
    const key = `${d.тип ?? 'Заявка'} — ${d.поминовение ?? ''}`
    const g = groups.get(key) ?? { names: [], count: 0 }
    g.names.push(...(d.имена ?? []))
    g.count++
    groups.set(key, g)
  }

  return (
    <div className="container-text py-12">
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin/collections/requests" className="link-underline">
          ← К заявкам
        </Link>
        <PrintButton />
      </div>
      <h1 className="text-h2">{id ? 'Заявка' : 'Новые записки'}</h1>
      <p className="mt-2 text-ink-2">
        Сформировано {formatStamp(new Date())}. Записок: {res.docs.length}.
      </p>
      {res.docs.length && res.docs[0].type !== 'zapiska' ? (
        <div className="mt-8 space-y-2">
          <p className="text-h3">{res.docs[0].summary}</p>
          <p>
            {res.docs[0].contactName} {res.docs[0].contactPhone} {res.docs[0].contactEmail}
          </p>
          <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(res.docs[0].details, null, 2)}</pre>
        </div>
      ) : (
        [...groups.entries()].map(([title, g]) => (
          <section key={title} className="print-avoid-break mt-10 border-t-2 border-ink pt-4">
            <h2 className="text-h3">
              {title} <span className="text-small font-normal text-ink-2">({g.count})</span>
            </h2>
            <ol className="mt-4 columns-2 gap-8 text-[1.25rem] leading-relaxed sm:columns-3">
              {g.names.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ol>
          </section>
        ))
      )}
      {!res.docs.length ? <p className="mt-8">Новых записок нет.</p> : null}
    </div>
  )
}
