import { Mail, Phone, Send } from 'lucide-react'

import { QuestionForm } from '@/components/forms/QuestionForm'
import { DonateBlock } from '@/components/ui/DonateBlock'
import { MapBlock } from '@/components/ui/MapBlock'
import { PageHeader } from '@/components/ui/PageHeader'
import { PathLabel } from '@/components/ui/PathLabel'
import { getChurches, getSettings } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

export const revalidate = 600

export const metadata = pageMeta({
  title: 'Контакты',
  description: 'Адреса храмов в Гаспре, телефоны, e-mail, карта и реквизиты прихода.',
  path: '/kontakty',
})

export default async function ContactsPage() {
  const [settings, churches] = await Promise.all([getSettings(), getChurches()])
  return (
    <>
      <PageHeader path="/контакты" title="Контакты" crumbs={[{ label: 'Контакты' }]} />
      <div className="container-site space-y-24">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <PathLabel>/телефоны</PathLabel>
            <ul className="mt-4 space-y-3">
              {(settings.phones ?? []).map((p) => (
                <li key={p.id}>
                  <a href={`tel:${p.number.replace(/[^\d+]/g, '')}`} className="tap inline-flex items-center gap-2 text-[1.375rem] font-medium link-underline">
                    <Phone size={20} strokeWidth={1.5} aria-hidden /> {p.number}
                  </a>
                  {p.label ? <p className="text-ink-2">{p.label}</p> : null}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <PathLabel>/почта-и-соцсети</PathLabel>
            <ul className="mt-4 space-y-3">
              {settings.email ? (
                <li>
                  <a href={`mailto:${settings.email}`} className="tap inline-flex items-center gap-2 link-underline">
                    <Mail size={20} strokeWidth={1.5} aria-hidden /> {settings.email}
                  </a>
                </li>
              ) : null}
              {settings.telegram ? (
                <li>
                  <a href={settings.telegram} className="tap inline-flex items-center gap-2 link-underline" target="_blank" rel="noopener noreferrer">
                    <Send size={20} strokeWidth={1.5} aria-hidden /> Telegram-канал прихода
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
          <div>
            <PathLabel>/часы-работы</PathLabel>
            <p className="mt-4 whitespace-pre-line">{settings.shopHours || 'Уточняйте по телефону.'}</p>
          </div>
        </div>

        <section>
          <PathLabel>/карта</PathLabel>
          <h2 className="mb-10 mt-2 text-h2">Адреса храмов</h2>
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
        </section>

        <section className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <PathLabel>/вопрос</PathLabel>
            <h2 className="mt-2 text-h2">Задать вопрос</h2>
            <p className="mt-4 text-ink-2 measure">Напишите — ответим по телефону или почте.</p>
          </div>
          <QuestionForm />
        </section>

        <section>
          <PathLabel>/реквизиты</PathLabel>
          <h2 className="mb-10 mt-2 text-h2">Реквизиты прихода</h2>
          {settings.parishName ? <p className="mb-6 font-medium">{settings.parishName}</p> : null}
          {settings.legalAddress ? <p className="-mt-4 mb-8 text-ink-2">Юридический адрес: {settings.legalAddress}</p> : null}
          <DonateBlock settings={settings} />
        </section>
      </div>
    </>
  )
}
