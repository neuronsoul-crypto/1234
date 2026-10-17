import { getChurches, getServices } from '@/lib/data'
import { addDays, todayKey } from '@/lib/dates'
import { buildCalendar } from '@/lib/ics'
import { SITE_URL } from '@/lib/site'

export const revalidate = 600

/** Подписка на весь календарь: /raspisanie.ics, или один храм: ?hram=svyatoy-niny */
export async function GET(request: Request) {
  const hram = new URL(request.url).searchParams.get('hram')
  const today = todayKey()
  const [services, churches] = await Promise.all([getServices(addDays(today, -7), addDays(today, 60)), getChurches()])
  const church = churches.find((c) => c.slug === hram)
  const list = church ? services.filter((s) => s.church.id === church.id) : services
  const body = buildCalendar(list, {
    name: church ? `Богослужения — ${church.shortName}` : 'Богослужения — Храмы Гаспры',
    siteUrl: SITE_URL,
    host: new URL(SITE_URL).hostname,
  })
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="raspisanie${church ? `-${church.slug}` : ''}.ics"`,
      'Cache-Control': 'public, max-age=600',
    },
  })
}
