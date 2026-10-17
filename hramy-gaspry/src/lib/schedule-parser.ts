/**
 * Разбор расписания, вставленного текстом:
 *   18 окт, сб — 17:00 Всенощное бдение (Нерушимая Стена)
 *   19.10 — 9:00 Божественная литургия (Нины); 17:00 Акафист
 *   Воскресенье, 26 октября            ← строка-дата, ниже — службы
 *   9:00 Божественная литургия (Нины)
 */
import { addDays, diffDays, type DayKey } from './dates'
import { guessServiceType, type ServiceType } from './service-types'

export type ParserChurch = { id: string | number; aliases: string[] }

export type ParsedService = {
  date: DayKey
  time: string
  title: string
  type: ServiceType
  churchId: string | number | null
  note: string
}

export type ParsedLine = {
  lineNo: number
  raw: string
  services: ParsedService[]
  /** Строка задаёт только дату для следующих строк. */
  dateOnly?: boolean
  /** Почему строку не удалось разобрать полностью. */
  errors: string[]
  /** Разобрано, но стоит проверить (например, день недели не совпадает с датой). */
  warnings: string[]
}

const MONTHS: Array<[RegExp, number]> = [
  [/^янв/, 1], [/^фев/, 2], [/^мар/, 3], [/^апр/, 4], [/^ма[йя]/, 5], [/^июн/, 6],
  [/^июл/, 7], [/^авг/, 8], [/^сен/, 9], [/^окт/, 10], [/^ноя/, 11], [/^дек/, 12],
]

const WEEKDAY_RE =
  /(^|[\s,.(])(пн|вт|ср|чт|пт|сб|вс|понедельник|вторник|среда|среду|четверг|пятница|пятницу|суббота|субботу|воскресенье)(?=$|[\s,.):—–-])/gi

const pad = (n: number) => String(n).padStart(2, '0')

const WEEKDAY_INDEX: Array<[RegExp, number]> = [
  [/^(вс|воскресенье)$/i, 0],
  [/^(пн|понедельник)$/i, 1],
  [/^(вт|вторник)$/i, 2],
  [/^(ср|среда|среду)$/i, 3],
  [/^(чт|четверг)$/i, 4],
  [/^(пт|пятница|пятницу)$/i, 5],
  [/^(сб|суббота|субботу)$/i, 6],
]
const WEEKDAY_NAMES = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

/** Проверка: совпадает ли указанный в строке день недели с датой. */
function weekdayWarning(line: string, date: DayKey): string | null {
  const head = line.split(/\d{1,2}[:.]\d{2}/)[0] // до первого времени
  const token = head.match(/(?:^|[\s,.(])(пн|вт|ср|чт|пт|сб|вс|понедельник|вторник|среда|среду|четверг|пятница|пятницу|суббота|субботу|воскресенье)(?=$|[\s,.):—–-])/i)?.[1]
  if (!token) return null
  const expected = WEEKDAY_INDEX.find(([re]) => re.test(token))?.[1]
  const actual = new Date(`${date}T12:00:00Z`).getUTCDay()
  if (expected === undefined || expected === actual) return null
  return `В строке указано «${token}», но ${Number(date.slice(8))}.${date.slice(5, 7)} — ${WEEKDAY_NAMES[actual]}. Проверьте дату.`
}

function inferYear(month: number, day: number, today: DayKey): DayKey {
  const year = Number(today.slice(0, 4))
  let key = `${year}-${pad(month)}-${pad(day)}`
  // Расписание составляют вперёд: дата «давно в прошлом» — это следующий год
  if (diffDays(key, today) < -60) key = `${year + 1}-${pad(month)}-${pad(day)}`
  if (diffDays(key, today) > 300) key = `${year - 1}-${pad(month)}-${pad(day)}`
  return key
}

function isRealDate(key: DayKey) {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

/** Ищет дату в начале строки. Возвращает дату и остаток строки. */
function extractDate(line: string, today: DayKey): { date?: DayKey; rest: string } {
  let s = line.trim()
  // «Сб, 18 окт» — день недели перед датой
  s = s.replace(/^(пн|вт|ср|чт|пт|сб|вс|понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)[\s,.]+/i, '')

  // 18.10 или 18.10.2026
  let m = s.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?(?!\d|:)/)
  if (m) {
    const day = Number(m[1])
    const month = Number(m[2])
    let key: DayKey
    if (m[3]) {
      const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])
      key = `${y}-${pad(month)}-${pad(day)}`
    } else key = inferYear(month, day, today)
    return { date: isRealDate(key) ? key : undefined, rest: s.slice(m[0].length) }
  }

  // 18 окт / 18 октября [2026]
  m = s.match(/^(\d{1,2})\s+([а-яё]+)\.?(?:\s+(\d{4})(?:\s*г(?:ода|\.)?)?)?/i)
  if (m) {
    const month = MONTHS.find(([re]) => re.test(m![2].toLowerCase()))?.[1]
    if (month) {
      const day = Number(m[1])
      const key = m[3] ? `${m[3]}-${pad(month)}-${pad(day)}` : inferYear(month, day, today)
      return { date: isRealDate(key) ? key : undefined, rest: s.slice(m[0].length) }
    }
  }
  return { rest: s }
}

function stripDecor(s: string) {
  return s
    .replace(WEEKDAY_RE, '$1')
    .replace(/^[\s,.;:—–-]+/, '')
    .replace(/[\s,;—–-]+$/, '')
    .trim()
}

function findChurch(text: string, churches: ParserChurch[]): ParserChurch | undefined {
  const t = text.toLowerCase()
  return churches.find((c) => c.aliases.some((a) => a && t.includes(a.toLowerCase())))
}

function parseServiceChunk(
  chunk: string,
  date: DayKey,
  churches: ParserChurch[],
  defaultChurch: string | number | null,
  errors: string[],
): ParsedService | null {
  const timeMatch = chunk.match(/(?:^|\s|в\s)([01]?\d|2[0-3])[:.]([0-5]\d)(?!\d)/)
  if (!timeMatch) {
    errors.push(`Не найдено время в «${chunk.trim()}»`)
    return null
  }
  const time = `${pad(Number(timeMatch[1]))}:${timeMatch[2]}`
  let rest = (chunk.slice(0, timeMatch.index) + ' ' + chunk.slice(timeMatch.index! + timeMatch[0].length))
    .replace(/\s+в\s*$/, ' ')
    .trim()

  let church: ParserChurch | undefined
  const notes: string[] = []
  rest = rest.replace(/\(([^)]*)\)/g, (_all, inner: string) => {
    const found = findChurch(inner, churches)
    if (found) church = found
    else if (inner.trim()) notes.push(inner.trim())
    return ' '
  })
  if (!church) church = findChurch(rest, churches)

  const title = stripDecor(rest.replace(/\s+/g, ' '))
  if (!title) {
    errors.push(`Не найдено название службы в «${chunk.trim()}»`)
    return null
  }
  const churchId = church?.id ?? defaultChurch
  if (churchId == null) errors.push(`Не указан храм для «${title}»`)

  return {
    date,
    time,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    type: guessServiceType(title),
    churchId: churchId ?? null,
    note: notes.join('; '),
  }
}

export function parseSchedule(
  text: string,
  options: { churches: ParserChurch[]; today: DayKey; defaultChurch?: string | number | null },
): ParsedLine[] {
  const { churches, today, defaultChurch = null } = options
  const result: ParsedLine[] = []
  let currentDate: DayKey | undefined

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim()
    if (!line) return
    const errors: string[] = []
    const warnings: string[] = []
    const { date, rest } = extractDate(line, today)
    if (date) {
      currentDate = date
      const w = weekdayWarning(line, date)
      if (w) warnings.push(w)
    }
    else if (/^\d{1,2}[.\s]/.test(line) && !/^\d{1,2}[:.]\d{2}/.test(line)) {
      errors.push('Не удалось распознать дату')
    }

    const body = stripDecor(rest)
    // Строка-заголовок вида «Воскресенье, 26 октября» (возможно, с названием праздника)
    if (date && !/\d{1,2}[:.]\d{2}/.test(body)) {
      result.push({ lineNo: index + 1, raw, services: [], dateOnly: true, errors, warnings })
      return
    }
    if (!currentDate) {
      errors.push('Перед службой не указана дата')
      result.push({ lineNo: index + 1, raw, services: [], errors, warnings })
      return
    }

    const chunks = body.split(/;|,\s*(?=(?:в\s)?\d{1,2}[:.]\d{2})/)
    const services = chunks
      .map((c) => parseServiceChunk(c, currentDate!, churches, defaultChurch, errors))
      .filter((s): s is ParsedService => Boolean(s))

    // Храм указан только у последней службы строки — применяем ко всем
    const named = services.filter((s) => s.churchId !== null && s.churchId !== defaultChurch)
    if (named.length === 1 && services.length > 1) {
      for (const s of services) if (s.churchId === defaultChurch || s.churchId === null) s.churchId = named[0].churchId
    }
    const filteredErrors = errors.filter(
      (e) => !(e.startsWith('Не указан храм') && services.every((s) => s.churchId !== null)),
    )
    result.push({ lineNo: index + 1, raw, services, errors: filteredErrors, warnings })
  })

  return result
}

/** Все даты недели начиная с понедельника — для генерации из шаблона. */
export function weekDays(monday: DayKey): DayKey[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}
