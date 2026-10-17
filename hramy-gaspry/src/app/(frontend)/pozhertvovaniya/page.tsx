import { CampaignProgress, DonateBlock } from '@/components/ui/DonateBlock'
import { PageHeader } from '@/components/ui/PageHeader'
import { PathLabel } from '@/components/ui/PathLabel'
import { getSettings } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

export const revalidate = 600

export const metadata = pageMeta({
  title: 'Пожертвования',
  description: 'Помочь приходу храмов Гаспры и реставрации храма святой Нины: QR-код СБП и реквизиты.',
  path: '/pozhertvovaniya',
})

export default async function DonatePage() {
  const settings = await getSettings()
  return (
    <>
      <PageHeader
        path="/пожертвования"
        title="Пожертвования"
        lead="Приход живёт на пожертвования прихожан и гостей. Ваша помощь идёт на содержание двух храмов, богослужение и реставрацию храма святой Нины — памятника архитектуры начала XX века."
        crumbs={[{ label: 'Пожертвования' }]}
      />
      <div className="container-site space-y-24">
        {settings.campaign?.enabled ? (
          <div className="max-w-3xl">
            <CampaignProgress settings={settings} />
          </div>
        ) : null}

        <section>
          <PathLabel>/как-пожертвовать</PathLabel>
          <h2 className="mb-10 mt-2 text-h2">QR-код и реквизиты</h2>
          <DonateBlock settings={settings} />
        </section>

        {settings.needs?.length ? (
          <section>
            <PathLabel>/нужды</PathLabel>
            <h2 className="mb-10 mt-2 text-h2">Нужды прихода</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {settings.needs.map((n) => (
                <li key={n.id} className="border-t-2 border-gold pt-4">
                  <h3 className="text-h3">{n.title}</h3>
                  {n.text ? <p className="mt-2 text-ink-2">{n.text}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  )
}
