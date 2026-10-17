'use client'
import { CalendarDays, Printer } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { DayGroup } from '@/components/ui/DayGroup'
import { ServiceRow } from '@/components/ui/ServiceRow'
import { addDays, formatDayMonth } from '@/lib/dates'
import { groupByDay } from '@/lib/schedule'
import { useClientValue } from '@/lib/use-client-value'
import type { ServiceItem } from '@/lib/types'

type Church = { slug: string; shortName: string; color: string }

const VIEWS = [
  { value: '2w', label: '2 недели', days: 14 },
  { value: 'week', label: 'Неделя', days: 7 },
  { value: 'month', label: 'Месяц', days: 31 },
] as const

type View = (typeof VIEWS)[number]['value']

/** Чипы-фильтр по храму. */
export function ChurchChips({
  churches,
  value,
  onChange,
}: {
  churches: Church[]
  value: string
  onChange: (v: string) => void
}) {
  const chip = (active: boolean) =>
    `tap inline-flex items-center gap-2 rounded-full border px-4 text-[1rem] transition-colors ${active ? 'border-ink bg-ink text-bg' : 'border-line hover:border-ink'}`
  return (
    <div role="group" aria-label="Храм" className="flex flex-wrap gap-2">
      <button type="button" className={chip(value === '')} aria-pressed={value === ''} onClick={() => onChange('')}>
        Оба храма
      </button>
      {churches.map((c) => (
        <button
          key={c.slug}
          type="button"
          className={chip(value === c.slug)}
          aria-pressed={value === c.slug}
          onClick={() => onChange(c.slug)}
        >
          <span
            aria-hidden
            className={`inline-block size-2.5 rounded-full ${c.color === 'nina' ? 'bg-nina' : c.color === 'stena' ? 'bg-stena' : 'bg-gold'}`}
          />
          {c.shortName}
        </button>
      ))}
    </div>
  )
}

const dayFeast = (list: ServiceItem[]) => {
  const withFeast = list.find((s) => s.feast) ?? list.find((s) => s.feastRank !== 'none')
  return { feast: withFeast?.feast ?? '', feastRank: list.find((s) => s.feastRank !== 'none')?.feastRank ?? 'none' }
}

export function ScheduleBrowser({
  services,
  churches,
  today,
  parishName,
}: {
  services: ServiceItem[]
  churches: Church[]
  today: string
  parishName: string
}) {
  // Фильтры из адреса (?hram=…&vid=…) — страница статическая, читаем их в браузере
  const search = useClientValue(() => window.location.search, '')
  const params = new URLSearchParams(search)
  const urlChurch = churches.some((c) => c.slug === params.get('hram')) ? params.get('hram')! : ''
  const urlView = VIEWS.some((x) => x.value === params.get('vid')) ? (params.get('vid') as View) : '2w'
  const [churchOverride, setChurch] = useState<string | null>(null)
  const [viewOverride, setView] = useState<View | null>(null)
  const church = churchOverride ?? urlChurch
  const view = viewOverride ?? urlView

  useEffect(() => {
    if (churchOverride === null && viewOverride === null) return
    const next = new URLSearchParams()
    if (church) next.set('hram', church)
    if (view !== '2w') next.set('vid', view)
    const qs = next.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }, [church, view, churchOverride, viewOverride])

  const days = VIEWS.find((v) => v.value === view)!.days
  const end = addDays(today, days)
  const filtered = useMemo(
    () => services.filter((s) => s.date >= today && s.date < end && (!church || s.church.slug === church)),
    [services, today, end, church],
  )
  const groups = groupByDay(filtered)
  const icsHref = `/raspisanie.ics${church ? `?hram=${church}` : ''}`
  const churchName = churches.find((c) => c.slug === church)?.shortName

  return (
    <div>
      <div className="no-print flex flex-col gap-6 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <ChurchChips churches={churches} value={church} onChange={setChurch} />
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Период" className="inline-flex rounded-btn border border-line">
            {VIEWS.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => setView(v.value)}
                aria-pressed={view === v.value}
                className={`tap px-4 text-[1rem] ${view === v.value ? 'bg-lazur text-lazur-ink' : 'hover:bg-ink/5'}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="tap inline-flex items-center gap-2 rounded-btn border border-line px-4 text-[1rem] hover:border-ink"
          >
            <Printer size={18} strokeWidth={1.5} aria-hidden /> Распечатать
          </button>
        </div>
      </div>

      <div className="print-only mb-6">
        <p className="text-[14pt] font-semibold">{parishName}</p>
        <p className="text-[18pt] font-semibold">
          Расписание богослужений{churchName ? ` · ${churchName}` : ''}
        </p>
        <p>
          {formatDayMonth(today)} — {formatDayMonth(addDays(today, days - 1))}
        </p>
      </div>

      {groups.length ? (
        <div className="mt-2">
          {groups.map(([date, list]) => {
            const f = dayFeast(list)
            return (
              <DayGroup key={date} date={date} today={today} feast={f.feast} feastRank={f.feastRank}>
                {list.map((s) => (
                  <ServiceRow key={s.id} service={s} showChurch={!church} />
                ))}
              </DayGroup>
            )
          })}
        </div>
      ) : (
        <p className="py-16 text-ink-2">На выбранный период служб пока нет. Расписание обновляется каждую неделю.</p>
      )}

      <div className="no-print mt-12 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <a href={icsHref} className="tap inline-flex items-center gap-2 text-lazur underline underline-offset-4">
          <CalendarDays size={20} strokeWidth={1.5} aria-hidden />
          Подписаться на расписание{churchName ? ` (${churchName})` : ''} в календаре телефона
        </a>
        <Link href="/raspisanie/proshedshie" className="tap inline-flex items-center link-underline text-ink-2">
          Прошедшие службы →
        </Link>
      </div>
    </div>
  )
}
