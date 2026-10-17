import Link from 'next/link'

import { PageHeader } from '@/components/ui/PageHeader'
import { getSacraments } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

export const revalidate = 600

export const metadata = pageMeta({
  title: 'Таинства и требы',
  description: 'Крещение, венчание, исповедь и причастие, отпевание, освящение: как подготовиться и записаться.',
  path: '/tainstva',
})

export default async function SacramentsPage() {
  const list = await getSacraments()
  return (
    <>
      <PageHeader
        path="/таинства"
        title="Таинства и требы"
        lead="Как подготовиться, какие нужны документы и когда совершается. Записаться можно через сайт — мы перезвоним."
        crumbs={[{ label: 'Таинства и требы' }]}
      />
      <div className="container-site">
        <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <li key={s.id} className="group relative bg-bg p-8 hover:bg-surface">
              <h2 className="text-h3 !text-[1.75rem]">
                <Link href={`/tainstva/${s.slug}`} className="link-underline after:absolute after:inset-0">
                  {s.title}
                </Link>
              </h2>
              <p className="mt-3 line-clamp-4 text-ink-2">{s.intro}</p>
              <span className="path-label mt-6 inline-block">/подробнее</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
