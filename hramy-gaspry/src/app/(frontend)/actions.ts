'use server'

import { headers } from 'next/headers'

import { getPayloadClient } from '@/lib/payload'
import { rateLimit } from '@/lib/rate-limit'

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> }

const str = (fd: FormData, key: string, max = 300) => String(fd.get(key) ?? '').trim().slice(0, max)

async function guard(fd: FormData): Promise<FormState | null> {
  // honeypot: поле видно только ботам
  if (str(fd, 'website')) return { ok: true, message: 'Спасибо! Заявка принята.' }
  const h = await headers()
  const ip = h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (!rateLimit(`form:${ip}`, 6, 10 * 60_000)) {
    return { ok: false, message: 'Слишком много заявок подряд. Попробуйте через несколько минут или позвоните нам.' }
  }
  if (fd.get('consent') !== 'yes') {
    return { ok: false, message: 'Проверьте форму.', errors: { consent: 'Нужно согласие на обработку персональных данных' } }
  }
  return null
}

const phoneOk = (p: string) => p.replace(/\D/g, '').length >= 10

const ZAPISKA_KINDS: Record<string, string> = {
  proskomidiya: 'Проскомидия (на литургии)',
  moleben: 'Молебен',
  sorokoust: 'Сорокоуст',
  panikhida: 'Панихида',
  godovoe: 'Поминовение в течение года',
}

export async function submitZapiska(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = await guard(fd)
  if (blocked) return blocked

  const type = str(fd, 'type') === 'upokoenie' ? 'upokoenie' : 'zdravie'
  const kind = str(fd, 'kind')
  const churchId = Number(str(fd, 'church')) || undefined
  const names = fd
    .getAll('names')
    .map((n) => String(n).trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 30)
  const contactName = str(fd, 'contactName', 100)
  const contactPhone = str(fd, 'contactPhone', 40)
  const errors: Record<string, string> = {}
  if (!ZAPISKA_KINDS[kind]) errors.kind = 'Выберите вид поминовения'
  if (kind === 'panikhida' && type === 'zdravie') errors.kind = 'Панихида служится только о упокоении'
  if (!names.length) errors.names = 'Впишите хотя бы одно имя'
  if (contactPhone && !phoneOk(contactPhone)) errors.contactPhone = 'Проверьте номер телефона'
  if (Object.keys(errors).length) return { ok: false, message: 'Проверьте форму.', errors }

  const typeLabel = type === 'zdravie' ? 'О здравии' : 'О упокоении'
  const payload = await getPayloadClient()
  await payload.create({
    collection: 'requests',
    overrideAccess: true,
    data: {
      type: 'zapiska',
      status: 'new',
      summary: `${typeLabel} · ${ZAPISKA_KINDS[kind]} · ${names.length} ${names.length === 1 ? 'имя' : names.length < 5 ? 'имени' : 'имён'}`,
      contactName,
      contactPhone,
      church: churchId,
      details: { тип: typeLabel, поминовение: ZAPISKA_KINDS[kind], имена: names },
      consentAt: new Date().toISOString(),
    },
  })
  return { ok: true, message: 'Записка принята. Имена будут помянуты за богослужением.' }
}

export async function submitSacrament(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = await guard(fd)
  if (blocked) return blocked
  const sacrament = str(fd, 'sacrament', 100)
  const contactName = str(fd, 'contactName', 100)
  const contactPhone = str(fd, 'contactPhone', 40)
  const date = str(fd, 'date', 20)
  const comment = str(fd, 'comment', 2000)
  const errors: Record<string, string> = {}
  if (!contactName) errors.contactName = 'Как к вам обращаться?'
  if (!phoneOk(contactPhone)) errors.contactPhone = 'Укажите телефон, чтобы мы могли перезвонить'
  if (Object.keys(errors).length) return { ok: false, message: 'Проверьте форму.', errors }

  const payload = await getPayloadClient()
  await payload.create({
    collection: 'requests',
    overrideAccess: true,
    data: {
      type: 'tainstvo',
      status: 'new',
      summary: `${sacrament || 'Таинство'}${date ? ` · ${date.split('-').reverse().join('.')}` : ''} · ${contactName}`,
      contactName,
      contactPhone,
      details: { таинство: sacrament, желаемаяДата: date, комментарий: comment },
      consentAt: new Date().toISOString(),
    },
  })
  return { ok: true, message: 'Заявка отправлена. Мы перезвоним, чтобы договориться о дне и подготовке.' }
}

export async function submitQuestion(_prev: FormState, fd: FormData): Promise<FormState> {
  const blocked = await guard(fd)
  if (blocked) return blocked
  const contactName = str(fd, 'contactName', 100)
  const contact = str(fd, 'contact', 100)
  const question = str(fd, 'question', 3000)
  const errors: Record<string, string> = {}
  if (!question) errors.question = 'Напишите ваш вопрос'
  if (!contact) errors.contact = 'Укажите телефон или e-mail для ответа'
  if (Object.keys(errors).length) return { ok: false, message: 'Проверьте форму.', errors }
  const payload = await getPayloadClient()
  const isEmail = contact.includes('@')
  await payload.create({
    collection: 'requests',
    overrideAccess: true,
    data: {
      type: 'vopros',
      status: 'new',
      summary: `Вопрос: ${question.slice(0, 80)}`,
      contactName,
      contactPhone: isEmail ? undefined : contact,
      contactEmail: isEmail ? contact : undefined,
      details: { вопрос: question },
      consentAt: new Date().toISOString(),
    },
  })
  return { ok: true, message: 'Спасибо! Мы ответим в ближайшее время.' }
}
