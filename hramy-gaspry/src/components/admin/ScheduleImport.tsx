'use client'
import { useState, useTransition } from 'react'

import { displayTime, formatShortDate } from '@/lib/dates'
import type { ParsedLine, ParsedService } from '@/lib/schedule-parser'

type Church = { id: number; shortName: string; color: string }

const EXAMPLE = `18 окт, сб — 17:00 Всенощное бдение (Нерушимая Стена)
19 окт, вс — 9:00 Божественная литургия (Нины)`

export function ScheduleImport({ churches }: { churches: Church[] }) {
  const [text, setText] = useState('')
  const [defaultChurch, setDefaultChurch] = useState<string>('')
  const [lines, setLines] = useState<ParsedLine[] | null>(null)
  const [publish, setPublish] = useState(true)
  const [message, setMessage] = useState('')
  const [pending, start] = useTransition()

  const parse = () =>
    start(async () => {
      setMessage('')
      const res = await fetch('/api/services/parse-text', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, defaultChurch: defaultChurch ? Number(defaultChurch) : null }),
      })
      const json = await res.json()
      if (!res.ok) return setMessage(json.error || 'Ошибка')
      setLines(json.lines)
    })

  const services: Array<ParsedService & { key: string }> = (lines ?? []).flatMap((l) =>
    l.services.map((s, i) => ({ ...s, key: `${l.lineNo}-${i}` })),
  )
  const ready = services.filter((s) => s.churchId)
  const problems = (lines ?? []).filter((l) => l.errors.length)
  const warnings = (lines ?? []).filter((l) => l.warnings?.length)

  const updateChurch = (key: string, churchId: number) =>
    setLines((prev) =>
      (prev ?? []).map((l) => ({
        ...l,
        services: l.services.map((s, i) => (`${l.lineNo}-${i}` === key ? { ...s, churchId } : s)),
      })),
    )

  const save = () =>
    start(async () => {
      const res = await fetch('/api/services/import', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: ready, publish }),
      })
      const json = await res.json()
      if (!res.ok) return setMessage(json.error || 'Ошибка')
      setMessage(
        `Сохранено служб: ${json.created}.${json.errors?.length ? ` Не сохранено: ${json.errors.join('; ')}` : ''}`,
      )
      if (json.created) {
        setLines(null)
        setText('')
      }
    })

  return (
    <div className="hg-import">
      <p>
        Вставьте расписание — каждую службу с новой строки. Храм пишите в скобках. Можно сначала написать дату
        отдельной строкой, а ниже — службы этого дня.
      </p>
      <pre className="hg-import__example">{EXAMPLE}</pre>
      <label className="hg-field">
        Текст расписания
        <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder={EXAMPLE} />
      </label>
      <label className="hg-field">
        Если храм не указан — считать, что служба в храме:
        <select value={defaultChurch} onChange={(e) => setDefaultChurch(e.target.value)}>
          <option value="">— не подставлять —</option>
          {churches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.shortName}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="btn btn--style-primary btn--size-medium" disabled={!text.trim() || pending} onClick={parse}>
        Разобрать и показать
      </button>

      {lines ? (
        <div className="hg-panel">
          <h2>Проверьте, что получилось</h2>
          {problems.length ? (
            <div className="hg-import__problems">
              <b>Не распознано строк: {problems.length}.</b> Исправьте текст выше и нажмите «Разобрать» ещё раз.
              <ul>
                {problems.map((l) => (
                  <li key={l.lineNo}>
                    Строка {l.lineNo}: «{l.raw}» — {l.errors.join('; ')}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {warnings.length ? (
            <div className="hg-import__warnings">
              <b>Проверьте:</b>
              <ul>
                {warnings.map((l) => (
                  <li key={l.lineNo}>
                    Строка {l.lineNo}: {l.warnings.join('; ')}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <table className="hg-import__table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Время</th>
                <th>Служба</th>
                <th>Храм</th>
                <th>Примечание</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.key} className={s.churchId ? '' : 'hg-import__bad'}>
                  <td>{formatShortDate(s.date)}</td>
                  <td>{displayTime(s.time)}</td>
                  <td>{s.title}</td>
                  <td>
                    <select value={s.churchId ?? ''} onChange={(e) => updateChurch(s.key, Number(e.target.value))}>
                      <option value="">— выберите —</option>
                      {churches.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.shortName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <label className="hg-check">
            <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} /> Сразу показать на
            сайте
          </label>
          <button type="button" className="btn btn--style-primary btn--size-medium" disabled={!ready.length || pending} onClick={save}>
            Сохранить служб: {ready.length}
          </button>
        </div>
      ) : null}
      {message ? (
        <p className="hg-week__msg" role="status">
          {message}
        </p>
      ) : null}
    </div>
  )
}
