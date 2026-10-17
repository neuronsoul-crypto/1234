import type { Endpoint, PayloadRequest } from 'payload'

import { hasRole } from '@/access/roles'
import { addDays, keyToStored, mondayOf, todayKey } from '@/lib/dates'
import { parseSchedule, type ParsedService } from '@/lib/schedule-parser'

const canEdit = (req: PayloadRequest) => hasRole(req.user, 'admin', 'editor', 'clergy')

const forbidden = () => Response.json({ error: 'Нет доступа' }, { status: 403 })

async function readJson<T>(req: PayloadRequest): Promise<Partial<T>> {
  try {
    return ((await req.json?.()) ?? {}) as Partial<T>
  } catch {
    return {}
  }
}

const weekRange = (monday: string) => ({
  and: [
    { date: { greater_than_equal: `${monday}T00:00:00.000Z` } },
    { date: { less_than: `${addDays(monday, 7)}T00:00:00.000Z` } },
  ],
})

/** POST /api/services/generate-week { monday?: 'YYYY-MM-DD' } — службы из шаблона (скрытые). */
export const generateWeekEndpoint: Endpoint = {
  path: '/generate-week',
  method: 'post',
  handler: async (req) => {
    if (!canEdit(req)) return forbidden()
    const body = await readJson<{ monday: string }>(req)
    const monday = mondayOf(body.monday || addDays(mondayOf(todayKey()), 7))
    const { payload } = req

    const templates = await payload.find({
      collection: 'schedule-templates',
      where: { active: { equals: true } },
      limit: 500,
      depth: 0,
      req,
    })
    const existing = await payload.find({ collection: 'services', where: weekRange(monday), limit: 1000, depth: 0, req })
    const taken = new Set(
      existing.docs.map((s) => `${String(s.date).slice(0, 10)}|${s.time}|${typeof s.church === 'object' ? s.church?.id : s.church}`),
    )

    let created = 0
    let skipped = 0
    for (const t of templates.docs) {
      const date = addDays(monday, Number(t.weekday) - 1)
      const church = typeof t.church === 'object' ? t.church?.id : t.church
      const key = `${date}|${t.time}|${church}`
      if (taken.has(key)) {
        skipped++
        continue
      }
      await payload.create({
        collection: 'services',
        data: {
          date: keyToStored(date),
          time: t.time,
          church: church as number,
          preset: (typeof t.preset === 'object' ? t.preset?.id : t.preset) ?? undefined,
          title: t.title ?? undefined,
          type: t.type ?? 'other',
          note: t.note ?? undefined,
          published: false,
        },
        req,
      })
      taken.add(key)
      created++
    }
    return Response.json({ monday, created, skipped })
  },
}

/** POST /api/services/parse-text { text, defaultChurch? } — предпросмотр разбора. */
export const parseTextEndpoint: Endpoint = {
  path: '/parse-text',
  method: 'post',
  handler: async (req) => {
    if (!canEdit(req)) return forbidden()
    const body = await readJson<{ text: string; defaultChurch: number | null }>(req)
    const churches = await req.payload.find({ collection: 'churches', limit: 20, depth: 0, req })
    const parserChurches = churches.docs.map((c) => ({
      id: c.id,
      aliases: [
        c.shortName?.toLowerCase(),
        ...(c.aliases ?? '').split(',').map((a) => a.trim().toLowerCase()),
      ].filter((a): a is string => Boolean(a)),
    }))
    const lines = parseSchedule(String(body.text ?? ''), {
      churches: parserChurches,
      today: todayKey(),
      defaultChurch: body.defaultChurch ?? null,
    })
    return Response.json({
      lines,
      churches: churches.docs.map((c) => ({ id: c.id, shortName: c.shortName, color: c.color })),
    })
  },
}

/** POST /api/services/import { services: ParsedService[], publish: boolean } */
export const importServicesEndpoint: Endpoint = {
  path: '/import',
  method: 'post',
  handler: async (req) => {
    if (!canEdit(req)) return forbidden()
    const body = await readJson<{ services: ParsedService[]; publish: boolean }>(req)
    const list = Array.isArray(body.services) ? body.services.slice(0, 300) : []
    let created = 0
    const errors: string[] = []
    for (const s of list) {
      if (!s.churchId || !s.date || !s.time || !s.title) {
        errors.push(`Пропущено: ${s.date ?? ''} ${s.time ?? ''} ${s.title ?? ''}`)
        continue
      }
      try {
        await req.payload.create({
          collection: 'services',
          data: {
            date: keyToStored(s.date),
            time: s.time,
            title: s.title,
            type: s.type,
            church: Number(s.churchId),
            note: s.note || undefined,
            published: body.publish !== false,
          },
          req,
        })
        created++
      } catch (e) {
        errors.push(`${s.date} ${s.time} ${s.title}: ${(e as Error).message}`)
      }
    }
    return Response.json({ created, errors })
  },
}

/** POST /api/services/publish-week { monday } — опубликовать все службы недели. */
export const publishWeekEndpoint: Endpoint = {
  path: '/publish-week',
  method: 'post',
  handler: async (req) => {
    if (!canEdit(req)) return forbidden()
    const body = await readJson<{ monday: string }>(req)
    const monday = mondayOf(body.monday || mondayOf(todayKey()))
    const res = await req.payload.update({
      collection: 'services',
      where: { and: [...weekRange(monday).and, { published: { equals: false } }] },
      data: { published: true },
      req,
    })
    return Response.json({ monday, published: res.docs.length })
  },
}
