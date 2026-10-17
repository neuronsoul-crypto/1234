import Link from 'next/link'

import { absoluteUrl } from '@/lib/site'

import { JsonLd } from './JsonLd'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: 'Главная', href: '/' }, ...items]
  return (
    <nav aria-label="Навигационная цепочка" className="no-print">
      <ol className="flex flex-wrap items-center gap-x-2 text-small text-ink-2">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="link-underline inline-flex min-h-11 items-center hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === all.length - 1 ? 'page' : undefined}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: absoluteUrl(c.href) } : {}),
          })),
        }}
      />
    </nav>
  )
}
