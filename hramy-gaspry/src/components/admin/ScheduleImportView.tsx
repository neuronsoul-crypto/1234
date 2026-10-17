import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'

import { hasRole } from '@/access/roles'

import { ScheduleImport } from './ScheduleImport'
import './dashboard.scss'

export async function ScheduleImportView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req } = initPageResult
  if (!req.user) redirect('/admin/login')
  const allowed = hasRole(req.user, 'admin', 'editor', 'clergy')
  const churches = await req.payload.find({ collection: 'churches', limit: 10, depth: 0, overrideAccess: true })

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <div className="hg-dash">
          <p>
            <Link href="/admin">← На главный экран</Link>
          </p>
          <h1>Вставить расписание текстом</h1>
          {allowed ? (
            <ScheduleImport churches={churches.docs.map((c) => ({ id: c.id, shortName: c.shortName, color: c.color }))} />
          ) : (
            <p>У вашей роли нет доступа к расписанию.</p>
          )}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
