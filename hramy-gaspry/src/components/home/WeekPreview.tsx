'use client'
import { useState } from 'react'

import { ChurchChips } from '@/components/schedule/ScheduleBrowser'
import { groupByDay } from '@/lib/schedule'
import { ChurchTag } from '@/components/ui/ChurchTag'
import { displayTime, formatShortDate } from '@/lib/dates'
import type { ServiceItem } from '@/lib/types'

/** Компактная таблица на неделю с переключателем храма. */
export function WeekPreview({
  services,
  churches,
}: {
  services: ServiceItem[]
  churches: Array<{ slug: string; shortName: string; color: string }>
}) {
  const [church, setChurch] = useState('')
  const groups = groupByDay(services.filter((s) => !church || s.church.slug === church))
  return (
    <div>
      <ChurchChips churches={churches} value={church} onChange={setChurch} />
      {groups.length ? (
        <table className="mt-8 w-full border-collapse text-left">
          <caption className="sr-only">Богослужения на ближайшую неделю</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">День</th>
              <th scope="col">Время</th>
              <th scope="col">Служба</th>
              <th scope="col">Храм</th>
            </tr>
          </thead>
          <tbody>
            {groups.flatMap(([date, list]) =>
              list.map((s, i) => (
                <tr key={s.id} className={`align-baseline ${i === 0 ? 'border-t border-line' : ''}`}>
                  <th scope="row" className="w-28 py-3 pr-4 text-[1rem] font-medium sm:w-40">
                    {i === 0 ? formatShortDate(date) : <span className="sr-only">{formatShortDate(date)}</span>}
                  </th>
                  <td className={`w-16 py-3 pr-4 font-display text-[1.375rem] font-semibold lining-nums tabular-nums ${s.status === 'cancelled' ? 'line-through text-ink-2' : ''}`}>
                    {displayTime(s.time)}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={s.status === 'cancelled' ? 'line-through text-ink-2' : ''}>{s.title}</span>
                    {s.status === 'cancelled' ? <span className="ml-2 text-small font-semibold text-feast">Отменено</span> : null}
                    <span className="mt-0.5 block sm:hidden">
                      {!church ? <ChurchTag color={s.church.color}>{s.church.shortName}</ChurchTag> : null}
                    </span>
                  </td>
                  <td className="hidden py-3 sm:table-cell">
                    {!church ? <ChurchTag color={s.church.color}>{s.church.shortName}</ChurchTag> : null}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      ) : (
        <p className="mt-8 text-ink-2">На этой неделе службы ещё не внесены в расписание.</p>
      )}
    </div>
  )
}
