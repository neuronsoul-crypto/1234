import type { ReactNode } from 'react'

import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { PathLabel } from './PathLabel'

export function PageHeader({
  path,
  title,
  lead,
  crumbs,
  children,
}: {
  path: string
  title: string
  lead?: string | null
  crumbs?: Crumb[]
  children?: ReactNode
}) {
  return (
    <div className="container-site pb-12 pt-6 md:pb-16">
      {crumbs ? <Breadcrumbs items={crumbs} /> : null}
      <div className="mt-10 md:mt-16">
        <PathLabel>{path}</PathLabel>
        <h1 className="mt-3 max-w-[18ch] font-display text-h1">{title}</h1>
        {lead ? <p className="mt-6 text-[1.25rem] leading-relaxed text-ink-2 measure">{lead}</p> : null}
        {children}
      </div>
    </div>
  )
}
