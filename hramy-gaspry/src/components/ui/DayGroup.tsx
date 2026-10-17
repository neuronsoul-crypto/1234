import type { ReactNode } from 'react'

import { feastOf } from '@/lib/church-calendar'
import { formatDayMonth, julianKey, WEEKDAYS } from '@/lib/dates'

import { FeastBadge } from './FeastBadge'

type Props = {
  date: string
  today?: string
  /** Праздник из расписания (вписан вручную) — приоритетнее расчётного. */
  feast?: string
  feastRank?: string
  /** Уровень заголовка дня: h2 на странице расписания, h3 внутри раздела. */
  level?: 'h2' | 'h3'
  children: ReactNode
}

/** Группа служб одного дня: дата по новому и старому стилю, праздник. */
export function DayGroup({ date, today, feast, feastRank, level = 'h2', children }: Props) {
  const Heading = level
  const computed = feastOf(date)
  const feastTitle = feast || computed?.title
  const rank = feastRank && feastRank !== 'none' ? feastRank : computed?.rank
  const weekday = WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()]
  const isSunday = weekday === 'воскресенье'
  const isToday = today === date
  const highlighted = rank === 'twelve' || rank === 'pascha'

  return (
    <section
      className={`print-avoid-break grid gap-4 border-t py-6 md:grid-cols-[16rem_1fr] md:gap-10 ${highlighted ? 'border-feast/50' : rank === 'great' ? 'border-gold' : 'border-line'}`}
      aria-labelledby={`day-${date}`}
    >
      <header>
        <Heading id={`day-${date}`} className={`font-display text-[1.75rem] ${isSunday || highlighted ? 'text-feast' : ''}`}>
          {formatDayMonth(date)}
        </Heading>
        <p className="mt-1 text-small capitalize text-ink-2">
          {isToday ? <span className="font-semibold text-gold-ink normal-case">Сегодня · </span> : null}
          {weekday}
          <span className="normal-case"> · {formatDayMonth(julianKey(date))} ст. ст.</span>
        </p>
        {feastTitle ? (
          <div className="mt-3 space-y-2">
            {rank ? <FeastBadge rank={rank} /> : null}
            <p className={`text-[1rem] leading-snug ${highlighted ? 'text-feast' : 'text-gold-ink'}`}>{feastTitle}</p>
          </div>
        ) : null}
      </header>
      <ul className="space-y-1">{children}</ul>
    </section>
  )
}
