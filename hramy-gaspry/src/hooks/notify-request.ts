import type { CollectionAfterChangeHook } from 'payload'

import { absoluteUrl } from '@/lib/site'
import { escapeHtml, sendTelegramMessage } from '@/lib/telegram'

const TYPE_LABEL: Record<string, string> = {
  zapiska: 'Новая записка',
  tainstvo: 'Запись на таинство',
  vopros: 'Вопрос с сайта',
}

/** Новая заявка → e-mail и Telegram ответственному (адреса — в «Настройках сайта»). */
export const notifyNewRequest: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create' || req.context?.skipNotify) return doc
  const { payload } = req
  try {
    const settings = await payload.findGlobal({ slug: 'settings', depth: 0, req, overrideAccess: true })
    const adminUrl = absoluteUrl(`/admin/collections/requests/${doc.id}`)
    const heading = TYPE_LABEL[doc.type] ?? 'Заявка с сайта'
    const lines = [
      `<b>${heading}</b>`,
      escapeHtml(doc.summary ?? ''),
      doc.contactName ? `Имя: ${escapeHtml(doc.contactName)}` : '',
      doc.contactPhone ? `Телефон: ${escapeHtml(doc.contactPhone)}` : '',
      `<a href="${adminUrl}">Открыть в админке</a>`,
    ].filter(Boolean)

    const chatId = settings?.notify?.telegramChatId || process.env.TELEGRAM_NOTIFY_CHAT_ID
    await sendTelegramMessage(chatId || undefined, lines.join('\n')).catch((err) =>
      payload.logger.error({ err, msg: 'Telegram: уведомление о заявке не отправлено' }),
    )

    const emails = (settings?.notify?.emails || settings?.email || '')
      .split(/[,;\s]+/)
      .filter((e: string) => e.includes('@'))
    if (emails.length && process.env.SMTP_HOST) {
      await payload
        .sendEmail({
          to: emails,
          subject: `${heading} — сайт храмов Гаспры`,
          html: lines.join('<br>'),
        })
        .catch((err: unknown) => payload.logger.error({ err, msg: 'E-mail о заявке не отправлен' }))
    }
  } catch (err) {
    payload.logger.error({ err, msg: 'Не удалось отправить уведомление о заявке' })
  }
  return doc
}
