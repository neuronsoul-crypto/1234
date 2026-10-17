import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SacramentForm } from '@/components/forms/SacramentForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { PathLabel } from '@/components/ui/PathLabel'
import { RichText } from '@/components/ui/RichText'
import { getSacrament, getSacraments } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

export const revalidate = 600

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getSacraments()).map((s) => ({ slug: s.slug ?? '' }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const s = await getSacrament(slug)
  if (!s) return {}
  return pageMeta({ title: s.title, description: s.intro, path: `/tainstva/${slug}` })
}

function Part({ path, title, children }: { path: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <PathLabel>{path}</PathLabel>
      <h2 className="mt-2 text-h3 !text-[1.75rem]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default async function SacramentPage({ params }: Props) {
  const { slug } = await params
  const s = await getSacrament(slug)
  if (!s) notFound()
  return (
    <>
      <PageHeader
        path="/таинства"
        title={s.title}
        lead={s.intro}
        crumbs={[{ label: 'Таинства и требы', href: '/tainstva' }, { label: s.title }]}
      />
      <div className="container-text">
        {s.preparation ? (
          <Part path="/подготовка" title="Как подготовиться">
            <RichText data={s.preparation} />
          </Part>
        ) : null}
        {s.documents ? (
          <Part path="/документы" title="Какие документы нужны">
            <RichText data={s.documents} />
          </Part>
        ) : null}
        {s.schedule ? (
          <Part path="/когда" title="Когда совершается">
            <p className="whitespace-pre-line">{s.schedule}</p>
          </Part>
        ) : null}
        {s.contact ? (
          <Part path="/к-кому-обращаться" title="К кому обращаться">
            <p className="whitespace-pre-line">{s.contact}</p>
          </Part>
        ) : null}
        {s.cta ? (
          <section id="zapis" className="border-t border-line py-10">
            <PathLabel>/запись</PathLabel>
            <h2 className="mt-2 text-h2">{s.cta}</h2>
            <p className="mb-8 mt-3 text-ink-2">Оставьте телефон — мы перезвоним и договоримся о дне и подготовке.</p>
            <SacramentForm sacrament={s.title} cta={s.cta} />
          </section>
        ) : null}
      </div>
    </>
  )
}
