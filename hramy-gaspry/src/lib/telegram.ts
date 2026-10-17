/** Минимальный клиент Telegram Bot API без внешних зависимостей. */
const API = 'https://api.telegram.org'

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export { escapeHtml }

async function call(method: string, body: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return { ok: false, skipped: true as const }
  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  })
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string }
  if (!json.ok) throw new Error(`Telegram ${method}: ${json.description ?? res.status}`)
  return { ok: true }
}

export function sendTelegramMessage(chatId: string | undefined, html: string) {
  if (!chatId) return Promise.resolve({ ok: false, skipped: true as const })
  return call('sendMessage', {
    chat_id: chatId,
    text: html,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: false },
  })
}

export function sendTelegramPhoto(chatId: string | undefined, photoUrl: string, captionHtml: string) {
  if (!chatId) return Promise.resolve({ ok: false, skipped: true as const })
  return call('sendPhoto', {
    chat_id: chatId,
    photo: photoUrl,
    caption: captionHtml.slice(0, 1024),
    parse_mode: 'HTML',
  })
}
