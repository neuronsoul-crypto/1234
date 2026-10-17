import Link from 'next/link'
import type { ServerProps } from 'payload'

import { hasRole } from '@/access/roles'
import { addDays, formatStamp, mondayOf, storedToKey, todayKey } from '@/lib/dates'

import { QuickSettings } from './QuickSettings'
import { WeekBoard, type BoardService } from './WeekBoard'
import './dashboard.scss'

const ACTION_LABEL: Record<string, string> = {
  create: 'создал(а)',
  update: 'изменил(а)',
  publish: 'опубликовал(а)',
  trash: 'убрал(а) в корзину',
  delete: 'удалил(а)',
}

const COLLECTION_LABEL: Record<string, string> = {
  services: 'службу',
  posts: 'новость',
  albums: 'альбом',
  media: 'фото',
  churches: 'страницу храма',
  clergy: 'духовенство',
  sacraments: 'таинство',
  pages: 'страницу',
  users: 'пользователя',
  settings: 'настройки',
}

export async function Dashboard({ payload, user }: ServerProps) {
  if (!user || !payload) return null
  const canSchedule = hasRole(user, 'admin', 'editor', 'clergy')
  const canContent = hasRole(user, 'admin', 'editor')
  const canRequests = hasRole(user, 'admin', 'clergy')
  const isAdmin = hasRole(user, 'admin')

  const monday = mondayOf(todayKey())
  const end = addDays(monday, 14)

  const [services, churches, newRequests, settings, log] = await Promise.all([
    canSchedule
      ? payload.find({
          collection: 'services',
          where: {
            and: [
              { date: { greater_than_equal: `${monday}T00:00:00.000Z` } },
              { date: { less_than: `${end}T00:00:00.000Z` } },
            ],
          },
          sort: ['date', 'time'],
          limit: 400,
          depth: 0,
          overrideAccess: true,
        })
      : null,
    payload.find({ collection: 'churches', limit: 10, depth: 0, overrideAccess: true }),
    canRequests
      ? payload.count({ collection: 'requests', where: { status: { equals: 'new' } }, overrideAccess: true })
      : null,
    isAdmin ? payload.findGlobal({ slug: 'settings', depth: 0, overrideAccess: true }) : null,
    isAdmin
      ? payload.find({ collection: 'audit-log', sort: '-createdAt', limit: 8, depth: 1, overrideAccess: true })
      : null,
  ])

  const boardServices: BoardService[] = (services?.docs ?? []).map((s) => ({
    id: s.id,
    date: storedToKey(s.date),
    time: s.time,
    title: s.title ?? '',
    church: typeof s.church === 'object' ? (s.church?.id ?? 0) : s.church,
    status: s.status ?? 'scheduled',
    published: Boolean(s.published),
    note: s.note ?? '',
  }))

  const tiles = [
    canContent && { href: '/admin/collections/posts/create', title: 'Новая новость', text: 'Заголовок, текст, фото — и «Опубликовать»' },
    canContent && { href: '/admin/collections/albums/create', title: 'Новый фотоальбом', text: 'Перетащите сразу все фото события' },
    canRequests && {
      href: '/admin/collections/requests?where[status][equals]=new',
      title: 'Заявки',
      text: 'Записки и записи на таинства',
      badge: newRequests?.totalDocs ?? 0,
    },
    canSchedule && { href: '/admin/raspisanie-tekstom', title: 'Вставить расписание текстом', text: 'Скопируйте расписание из сообщения' },
    canSchedule && { href: '/admin/collections/schedule-templates', title: 'Шаблон недели', text: 'Постоянное расписание обычной недели' },
    isAdmin && { href: '/admin/globals/settings', title: 'Настройки сайта', text: 'Телефоны, реквизиты, QR-код' },
  ].filter(Boolean) as Array<{ href: string; title: string; text: string; badge?: number }>

  return (
    <div className="hg-dash">
      <div className="hg-dash__hello">
        <h1>Здравствуйте{user && 'name' in user && user.name ? `, ${String(user.name)}` : ''}!</h1>
        <p>Что нужно сделать? Выберите действие ниже.</p>
      </div>

      <div className="hg-tiles">
        {tiles.map((t) => (
          <a key={t.href} href={t.href} className="hg-tile">
            <span className="hg-tile__title">
              {t.title}
              {typeof t.badge === 'number' && t.badge > 0 ? <span className="hg-badge">{t.badge}</span> : null}
            </span>
            <span className="hg-tile__text">{t.text}</span>
          </a>
        ))}
      </div>

      {canSchedule ? (
        <WeekBoard
          monday={monday}
          today={todayKey()}
          services={boardServices}
          churches={churches.docs.map((c) => ({ id: c.id, shortName: c.shortName, color: c.color }))}
        />
      ) : null}

      {isAdmin && settings ? (
        <QuickSettings
          banner={{
            enabled: Boolean(settings.banner?.enabled),
            text: settings.banner?.text ?? '',
            until: settings.banner?.until ?? '',
          }}
          campaign={{
            enabled: Boolean(settings.campaign?.enabled),
            title: settings.campaign?.title ?? '',
            goal: settings.campaign?.goal ?? 0,
            collected: settings.campaign?.collected ?? 0,
          }}
        />
      ) : null}

      {log && log.docs.length ? (
        <section className="hg-panel">
          <h2>Последние изменения</h2>
          <ul className="hg-log">
            {log.docs.map((entry) => (
              <li key={entry.id}>
                <span className="hg-log__when">{formatStamp(entry.createdAt)}</span>{' '}
                <b>{typeof entry.user === 'object' && entry.user ? entry.user.name : 'Система'}</b>{' '}
                {ACTION_LABEL[entry.action ?? ''] ?? entry.action}{' '}
                {COLLECTION_LABEL[entry.collectionSlug ?? ''] ?? entry.collectionSlug} «{entry.docTitle}»
              </li>
            ))}
          </ul>
          <Link href="/admin/collections/audit-log">Весь журнал →</Link>
        </section>
      ) : null}

      <h2 className="hg-dash__all">Все разделы</h2>
    </div>
  )
}
