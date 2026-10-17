'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { addDays, displayTime, formatDayMonth, WEEKDAYS } from '@/lib/dates'

export type BoardService = {
  id: number
  date: string
  time: string
  title: string
  church: number
  status: string
  published: boolean
  note: string
}

type Church = { id: number; shortName: string; color: string }

async function api(path: string, method: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.errors?.[0]?.message || json?.error || 'Ошибка сохранения')
  return json
}

export function WeekBoard({
  monday,
  today,
  services,
  churches,
}: {
  monday: string
  today: string
  services: BoardService[]
  churches: Church[]
}) {
  const router = useRouter()
  const [week, setWeek] = useState(0)
  const [message, setMessage] = useState<string>('')
  const [moving, setMoving] = useState<number | null>(null)
  const [newTime, setNewTime] = useState('')
  const [pending, startTransition] = useTransition()

  const start = addDays(monday, week * 7)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const weekServices = services.filter((s) => s.date >= start && s.date < addDays(start, 7))
  const hidden = weekServices.filter((s) => !s.published).length
  const churchById = new Map(churches.map((c) => [c.id, c]))

  const run = (fn: () => Promise<string>) =>
    startTransition(async () => {
      try {
        setMessage(await fn())
        router.refresh()
      } catch (e) {
        setMessage((e as Error).message)
      }
    })

  const generate = () =>
    run(async () => {
      const r = await api('/api/services/generate-week', 'POST', { monday: start })
      return r.created
        ? `Создано служб: ${r.created}. Они пока скрыты — проверьте и нажмите «Опубликовать неделю».`
        : 'Все службы из шаблона уже есть на этой неделе.'
    })

  const publish = () =>
    run(async () => {
      const r = await api('/api/services/publish-week', 'POST', { monday: start })
      return `Опубликовано служб: ${r.published}.`
    })

  const setStatus = (s: BoardService, status: string) =>
    run(async () => {
      await api(`/api/services/${s.id}`, 'PATCH', { status })
      return status === 'cancelled' ? `«${s.title}» отменена — на сайте видна пометка.` : `«${s.title}» снова по расписанию.`
    })

  const move = (s: BoardService) =>
    run(async () => {
      if (!/^\d{1,2}:\d{2}$/.test(newTime)) throw new Error('Время укажите так: 9:30')
      await api(`/api/services/${s.id}`, 'PATCH', {
        time: newTime,
        status: 'moved',
        note: `Перенесено с ${s.time}${s.note ? `. ${s.note}` : ''}`,
      })
      setMoving(null)
      setNewTime('')
      return `«${s.title}» перенесена на ${newTime}.`
    })

  return (
    <section className="hg-panel hg-week">
      <div className="hg-week__head">
        <h2>Расписание на неделю</h2>
        <div className="hg-week__tabs" role="tablist">
          <button type="button" role="tab" aria-selected={week === 0} onClick={() => setWeek(0)}>
            Эта неделя
          </button>
          <button type="button" role="tab" aria-selected={week === 1} onClick={() => setWeek(1)}>
            Следующая
          </button>
        </div>
      </div>
      <p className="hg-week__range">
        {formatDayMonth(start)} — {formatDayMonth(addDays(start, 6))}
        {hidden ? <span className="hg-week__hidden"> · скрыто служб: {hidden}</span> : null}
      </p>

      <div className="hg-week__actions">
        <button type="button" className="btn btn--style-primary btn--size-medium" disabled={pending} onClick={generate}>
          Заполнить из шаблона
        </button>
        <Link className="btn btn--style-secondary btn--size-medium" href="/admin/raspisanie-tekstom">
          Вставить текстом
        </Link>
        {hidden ? (
          <button type="button" className="btn btn--style-primary btn--size-medium" disabled={pending} onClick={publish}>
            Опубликовать неделю
          </button>
        ) : null}
        <Link className="btn btn--style-secondary btn--size-medium" href="/admin/collections/services/create">
          + Служба
        </Link>
      </div>
      {message ? (
        <p className="hg-week__msg" role="status">
          {message}
        </p>
      ) : null}

      <div className="hg-days">
        {days.map((day, i) => {
          const list = weekServices.filter((s) => s.date === day)
          return (
            <div key={day} className={`hg-day${day === today ? ' hg-day--today' : ''}`}>
              <div className="hg-day__name">
                {WEEKDAYS[(i + 1) % 7]}, {formatDayMonth(day)}
              </div>
              {list.length === 0 ? <div className="hg-day__empty">нет служб</div> : null}
              {list.map((s) => {
                const church = churchById.get(s.church)
                return (
                  <div key={s.id} className={`hg-svc hg-svc--${s.status}${s.published ? '' : ' hg-svc--draft'}`}>
                    <div className="hg-svc__main">
                      <b>{displayTime(s.time)}</b> {s.title}
                      {church ? <span className={`hg-tag hg-tag--${church.color}`}>{church.shortName}</span> : null}
                      {!s.published ? <span className="hg-tag hg-tag--draft">скрыта</span> : null}
                      {s.status === 'cancelled' ? <span className="hg-tag hg-tag--cancel">отменена</span> : null}
                      {s.status === 'moved' ? <span className="hg-tag hg-tag--moved">перенесена</span> : null}
                    </div>
                    {moving === s.id ? (
                      <div className="hg-svc__move">
                        <label>
                          Новое время{' '}
                          <input
                            autoFocus
                            inputMode="numeric"
                            placeholder="9:30"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                          />
                        </label>
                        <button type="button" disabled={pending} onClick={() => move(s)}>
                          Сохранить
                        </button>
                        <button type="button" onClick={() => setMoving(null)}>
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <div className="hg-svc__actions">
                        {s.status === 'cancelled' ? (
                          <button type="button" disabled={pending} onClick={() => setStatus(s, 'scheduled')}>
                            Вернуть
                          </button>
                        ) : (
                          <button type="button" disabled={pending} onClick={() => setStatus(s, 'cancelled')}>
                            Отменить
                          </button>
                        )}
                        <button type="button" onClick={() => setMoving(s.id)}>
                          Перенести
                        </button>
                        <Link href={`/admin/collections/services/${s.id}`}>Изменить</Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </section>
  )
}
