import { CalendarPlus } from 'lucide-react'

import { displayTime } from '@/lib/dates'
import type { ServiceItem } from '@/lib/types'

import { ChurchTag, churchStripe } from './ChurchTag'

/** Строка службы: время, название, храм, служащий, примечание, «в календарь». */
export function ServiceRow({ service, showChurch = true }: { service: ServiceItem; showChurch?: boolean }) {
  const cancelled = service.status === 'cancelled'
  const moved = service.status === 'moved'
  return (
    <li
      className={`print-avoid-break grid grid-cols-[4.25rem_1fr] gap-x-4 border-l-2 py-3 pl-4 sm:grid-cols-[5rem_1fr_auto] ${churchStripe(service.church.color)}`}
    >
      <div
        className={`font-display text-[1.75rem] font-semibold leading-none lining-nums tabular-nums ${cancelled ? 'text-ink-2 line-through' : ''}`}
      >
        {displayTime(service.time)}
      </div>
      <div className="min-w-0">
        <div className={`text-[1.125rem] font-medium leading-snug ${cancelled ? 'text-ink-2 line-through' : ''}`}>
          {service.title}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          {cancelled ? (
            <span className="text-small font-semibold uppercase tracking-[0.04em] text-feast">Отменено</span>
          ) : null}
          {moved ? (
            <span className="text-small font-semibold uppercase tracking-[0.04em] text-gold-ink">Новое время</span>
          ) : null}
          {showChurch ? <ChurchTag color={service.church.color}>{service.church.shortName}</ChurchTag> : null}
          {service.celebrant ? <span className="text-small text-ink-2">{service.celebrant}</span> : null}
          {service.note ? <span className="text-small text-ink-2">{service.note}</span> : null}
        </div>
      </div>
      {!cancelled ? (
        <a
          href={`/raspisanie/ics/${service.id}`}
          className="no-print col-start-2 mt-2 inline-flex min-h-11 items-center gap-1.5 self-start text-small text-lazur sm:col-start-3 sm:mt-0"
          aria-label={`Добавить в календарь: ${service.title}, ${displayTime(service.time)}`}
          rel="nofollow"
        >
          <CalendarPlus size={18} strokeWidth={1.5} aria-hidden />
          <span className="sm:sr-only lg:not-sr-only">В календарь</span>
        </a>
      ) : null}
    </li>
  )
}
