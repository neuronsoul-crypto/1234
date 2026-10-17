import Link from 'next/link'

import { DayGroup } from '@/components/ui/DayGroup'
import { PageHeader } from '@/components/ui/PageHeader'
import { ServiceRow } from '@/components/ui/ServiceRow'
import { getServices } from '@/lib/data'
import { addDays, todayKey } from '@/lib/dates'
import { groupByDay } from '@/lib/schedule'
import { pageMeta } from '@/lib/seo'

export const revalidate = 600

export const metadata = pageMeta({ title: 'Прошедшие службы', path: '/raspisanie/proshedshie', noindex: true })

export default async function PastServicesPage() {
  const today = todayKey()
  const services = await getServices(addDays(today, -30), today)
  const groups = groupByDay(services).reverse()
  return (
    <>
      <PageHeader
        path="/расписание/прошедшие"
        title="Прошедшие службы"
        lead="Богослужения за последние 30 дней."
        crumbs={[{ label: 'Расписание', href: '/raspisanie' }, { label: 'Прошедшие' }]}
      />
      <div className="container-site">
        {groups.length ? (
          groups.map(([date, list]) => (
            <DayGroup key={date} date={date}>
              {list.map((s) => (
                <ServiceRow key={s.id} service={s} />
              ))}
            </DayGroup>
          ))
        ) : (
          <p className="text-ink-2">За последний месяц записей нет.</p>
        )}
        <p className="mt-12">
          <Link href="/raspisanie" className="link-underline">
            ← К ближайшим службам
          </Link>
        </p>
      </div>
    </>
  )
}
