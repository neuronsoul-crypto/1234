import type { CollectionAfterChangeHook } from 'payload'

import { absoluteUrl } from '@/lib/site'
import { escapeHtml, sendTelegramMessage, sendTelegramPhoto } from '@/lib/telegram'

/** Автопостинг опубликованной новости в Telegram-канал прихода (один раз). */
export const postToTelegram: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (req.context?.skipTelegram) return doc
  if (doc._status !== 'published' || !doc.sendToTelegram || doc.telegramSentAt) return doc
  const channel = process.env.TELEGRAM_CHANNEL_ID
  if (!process.env.TELEGRAM_BOT_TOKEN || !channel) return doc

  const url = absoluteUrl(`/novosti/${doc.slug}`)
  const text = `<b>${escapeHtml(doc.title)}</b>\n\n${escapeHtml(doc.lead ?? '')}\n\n<a href="${url}">Читать на сайте</a>`
  try {
    let coverUrl: string | undefined
    if (doc.cover) {
      const cover =
        typeof doc.cover === 'object'
          ? doc.cover
          : await req.payload.findByID({ collection: 'media', id: doc.cover, depth: 0, req })
      coverUrl = cover?.sizes?.card?.url ?? cover?.url ?? undefined
    }
    if (coverUrl) {
      await sendTelegramPhoto(channel, absoluteUrl(coverUrl), text).catch(() =>
        sendTelegramMessage(channel, text),
      )
    } else {
      await sendTelegramMessage(channel, text)
    }
    await req.payload.update({
      collection: 'posts',
      id: doc.id,
      data: { telegramSentAt: new Date().toISOString() },
      context: { skipTelegram: true, skipAudit: true, disableRevalidate: true },
      req,
    })
  } catch (error) {
    req.payload.logger.error({ err: error, msg: 'Не удалось отправить новость в Telegram' })
  }
  return doc
}
