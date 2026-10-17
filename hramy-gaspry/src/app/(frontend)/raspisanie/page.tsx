import { ScheduleBrowser } from '@/components/schedule/ScheduleBrowser'
import { JsonLd } from '@/components/ui/JsonLd'
import { PageHeader } from '@/components/ui/PageHeader'
import { getChurches, getServices, getSettings } from '@/lib/data'
import { addDays, todayKey } from '@/lib/dates'
import { serviceEventsJsonLd } from '@/lib/schema'
import { pageMeta } from '@/lib/seo'

export const revalidate = 600

export const metadata = pageMeta({
  title: 'Расписание богослужений',
  description: 'Расписание богослужений храма св. Нины и церкви «Нерушимая Стена» в Гаспре на две недели и месяц вперёд.',
  path: '/raspisanie',
})

export default async function SchedulePage() {
  const today = todayKey()
  const [services, churches, settings] = await Promise.all([
    getServices(today, addDays(today, 32)),
    getChurches(),
    getSettings(),
  ])
  return (
    <>
      <PageHeader
        path="/расписание"
        title="Расписание богослужений"
        lead="Службы в обоих храмах прихода. Выберите храм и период; расписание можно распечатать или добавить в календарь телефона."
        crumbs={[{ label: 'Расписание' }]}
      />
      <div className="container-site">
        <ScheduleBrowser
          services={services}
          today={today}
          parishName={settings.parishName}
          churches={churches.map((c) => ({ slug: c.slug ?? '', shortName: c.shortName, color: c.color }))}
        />
      </div>
      <JsonLd data={serviceEventsJsonLd(services.filter((s) => s.date < addDays(today, 14)))} />
    </>
  )
}
