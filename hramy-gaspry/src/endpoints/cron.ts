import type { Endpoint, PayloadRequest } from 'payload'

import { addDays, mondayOf, todayKey } from '@/lib/dates'
import { sendTelegramMessage } from '@/lib/telegram'

/** Системный cron на сервере вызывает эти адреса с заголовком Authorization: Bearer $CRON_SECRET. */
const authorized = (req: PayloadRequest) => {
  const secret = process.env.CRON_SECRET
  return Boolean(secret) && req.headers.get('authorization') === `Bearer ${secret}`
}

/** Понедельник, 10:00 — напоминание, если на следующую неделю нет ни одной службы. */
export const weeklyReminderEndpoint: Endpoint = {
  path: '/cron/weekly-reminder',
  method: 'post',
  handler: async (req) => {
    if (!authorized(req)) return Response.json({ error: 'Нет доступа' }, { status: 401 })
    const monday = addDays(mondayOf(todayKey()), 7)
    const { totalDocs } = await req.payload.count({
      collection: 'services',
      where: {
        and: [
          { date: { greater_than_equal: `${monday}T00:00:00.000Z` } },
          { date: { less_than: `${addDays(monday, 7)}T00:00:00.000Z` } },
        ],
      },
      overrideAccess: true,
    })
    if (totalDocs > 0) return Response.json({ sent: false, services: totalDocs })
    const settings = await req.payload.findGlobal({ slug: 'settings', depth: 0, overrideAccess: true })
    const chatId = settings?.notify?.telegramChatId || process.env.TELEGRAM_NOTIFY_CHAT_ID
    await sendTelegramMessage(
      chatId || undefined,
      `<b>Расписание на следующую неделю не заполнено</b>\nНеделя с ${monday.split('-').reverse().join('.')}. Откройте админку → «Расписание на неделю» → «Заполнить из шаблона».`,
    )
    return Response.json({ sent: true })
  },
}

/** Ежедневно — окончательно удалить то, что лежит в корзине дольше 30 дней. */
export const purgeTrashEndpoint: Endpoint = {
  path: '/cron/purge-trash',
  method: 'post',
  handler: async (req) => {
    if (!authorized(req)) return Response.json({ error: 'Нет доступа' }, { status: 401 })
    const before = new Date(Date.now() - 30 * 86_400_000).toISOString()
    const result: Record<string, number> = {}
    for (const collection of ['posts', 'albums', 'pages', 'requests'] as const) {
      const res = await req.payload.delete({
        collection,
        where: { deletedAt: { less_than: before } },
        trash: true,
        overrideAccess: true,
      })
      result[collection] = res.docs.length
    }
    // Пустые черновики: автосохранение создаёт запись, как только открыли «Новая новость»
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString()
    for (const collection of ['posts', 'pages'] as const) {
      const res = await req.payload.delete({
        collection,
        where: {
          and: [
            { _status: { equals: 'draft' } },
            { or: [{ title: { exists: false } }, { title: { equals: '' } }] },
            { updatedAt: { less_than: dayAgo } },
          ],
        },
        trash: true,
        overrideAccess: true,
      })
      result[`${collection}-empty-drafts`] = res.docs.length
    }
    return Response.json({ purged: result })
  },
}
