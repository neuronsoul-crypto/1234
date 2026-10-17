import type { ServiceItem } from './types'

/** Календарь iCalendar (RFC 5545): открывается в Google, Apple и других календарях. */
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Simferopol',
  'BEGIN:STANDARD',
  'DTSTART:19700101T000000',
  'TZOFFSETFROM:+0300',
  'TZOFFSETTO:+0300',
  'TZNAME:MSK',
  'END:STANDARD',
  'END:VTIMEZONE',
]

const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** Перенос длинных строк по 75 октетов. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const parts: string[] = []
  let current = ''
  let size = 0
  for (const ch of line) {
    const len = new TextEncoder().encode(ch).length
    if (size + len > (parts.length ? 74 : 75)) {
      parts.push(current)
      current = ''
      size = 0
    }
    current += ch
    size += len
  }
  parts.push(current)
  return parts.join('\r\n ')
}

const DURATION_MIN: Record<string, number> = {
  liturgy: 120,
  vigil: 150,
  vespers: 60,
  matins: 90,
  moleben: 45,
  panikhida: 45,
  akathist: 45,
  sacrament: 60,
  other: 60,
}

const local = (date: string, time: string) => `${date.replace(/-/g, '')}T${time.replace(':', '')}00`

function addMinutes(date: string, time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number)
  const d = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)), h, m + minutes))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`
}

export function buildCalendar(services: ServiceItem[], opts: { name: string; siteUrl: string; host: string }) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hramy Gaspry//Raspisanie//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escape(opts.name)}`,
    'X-WR-TIMEZONE:Europe/Simferopol',
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
    ...VTIMEZONE,
  ]
  for (const s of services) {
    const description = [s.feast, s.celebrant, s.note].filter(Boolean).join('. ')
    lines.push(
      'BEGIN:VEVENT',
      `UID:service-${s.id}@${opts.host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Simferopol:${local(s.date, s.time)}`,
      `DTEND;TZID=Europe/Simferopol:${addMinutes(s.date, s.time, DURATION_MIN[s.type] ?? 60)}`,
      `SUMMARY:${escape(`${s.status === 'cancelled' ? 'ОТМЕНЕНО: ' : ''}${s.title}`)}`,
      `LOCATION:${escape(`${s.church.name}, ${s.church.address}`)}`,
      ...(description ? [`DESCRIPTION:${escape(description)}`] : []),
      `URL:${opts.siteUrl}/raspisanie`,
      `STATUS:${s.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}
