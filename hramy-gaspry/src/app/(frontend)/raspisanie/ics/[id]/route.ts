import { toServiceItem } from '@/lib/data'
import { buildCalendar } from '@/lib/ics'
import { getPayloadClient } from '@/lib/payload'
import { SITE_URL } from '@/lib/site'

/** Одна служба в формате .ics — кнопка «Добавить в календарь». */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) return new Response('Не найдено', { status: 404 })
  const payload = await getPayloadClient()
  const s = await payload.findByID({ collection: 'services', id: Number(id), depth: 1 }).catch(() => null)
  const item = s?.published ? toServiceItem(s) : null
  if (!item) return new Response('Не найдено', { status: 404 })
  const body = buildCalendar([item], { name: item.title, siteUrl: SITE_URL, host: new URL(SITE_URL).hostname })
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="sluzhba-${item.date}.ics"`,
    },
  })
}
