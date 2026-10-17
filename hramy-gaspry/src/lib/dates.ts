/** Даты сайта — по времени Крыма (Europe/Simferopol, UTC+3 без перехода на летнее время). */
export const TIME_ZONE = 'Europe/Simferopol'

export const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]
export const MONTHS_NOM = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
export const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
export const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
export const WEEKDAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

/** Календарный день в виде 'YYYY-MM-DD'. */
export type DayKey = string

const pad = (n: number) => String(n).padStart(2, '0')

/** Текущая дата в Крыму. */
export function todayKey(now: Date = new Date()): DayKey {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  return parts
}

/** Текущее время в Крыму, 'HH:MM'. */
export function nowTime(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
}

export function keyToUTCDate(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function utcDateToKey(date: Date): DayKey {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

export function addDays(key: DayKey, days: number): DayKey {
  const d = keyToUTCDate(key)
  d.setUTCDate(d.getUTCDate() + days)
  return utcDateToKey(d)
}

export function diffDays(a: DayKey, b: DayKey): number {
  return Math.round((keyToUTCDate(a).getTime() - keyToUTCDate(b).getTime()) / 86_400_000)
}

/** 0 — воскресенье … 6 — суббота. */
export function weekdayOf(key: DayKey): number {
  return keyToUTCDate(key).getUTCDay()
}

/** Понедельник недели, в которую входит день. */
export function mondayOf(key: DayKey): DayKey {
  const wd = weekdayOf(key)
  return addDays(key, wd === 0 ? -6 : 1 - wd)
}

/**
 * Даты в базе храним как полдень UTC выбранного дня — так календарный день
 * не «съезжает» ни в одном часовом поясе.
 */
export function keyToStored(key: DayKey): string {
  return `${key}T12:00:00.000Z`
}

/** Из значения поля даты Payload — в 'YYYY-MM-DD' по крымскому времени. */
export function storedToKey(value: string | Date | null | undefined): DayKey {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  return todayKey(date)
}

/** «18 октября» */
export function formatDayMonth(key: DayKey): string {
  const [, m, d] = key.split('-').map(Number)
  return `${d} ${MONTHS_GEN[m - 1]}`
}

/** «18 октября 2026» */
export function formatLongDate(key: DayKey): string {
  const [y] = key.split('-').map(Number)
  return `${formatDayMonth(key)} ${y}`
}

/** «Сб, 18 окт» */
export function formatShortDate(key: DayKey): string {
  const [, m, d] = key.split('-').map(Number)
  return `${WEEKDAYS_SHORT[weekdayOf(key)]}, ${d} ${MONTHS_SHORT[m - 1]}`
}

/** Дата по старому (юлианскому) стилю. Для 1900–2099 годов разница — 13 дней. */
export function julianKey(key: DayKey): DayKey {
  return addDays(key, -13)
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export const isValidTime = (t: string) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(t)

export const normalizeTime = (t: string) => {
  const [h, m] = t.split(':')
  return `${pad(Number(h))}:${m}`
}

/** «17 октября, 15:20» — для журнала действий. */
export function formatStamp(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** «08:30» → «8:30» — так время пишут в расписаниях. */
export const displayTime = (t: string) => t.replace(/^0(\d)/, '$1')

/** Дата уже прошла? */
export const isPast = (value: string | Date) => new Date(value).getTime() < Date.now()
