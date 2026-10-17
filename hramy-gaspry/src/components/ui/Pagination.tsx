import Link from 'next/link'

type Props = { page: number; totalPages: number; hrefFor: (page: number) => string }

export function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <nav aria-label="Страницы" className="no-print mt-16 flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="tap inline-flex items-center px-3 link-underline" rel="prev">
          ← Назад
        </Link>
      ) : null}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`tap inline-flex items-center justify-center rounded-btn border px-3 ${p === page ? 'border-ink bg-ink text-bg' : 'border-line hover:border-ink'}`}
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className="tap inline-flex items-center px-3 link-underline" rel="next">
          Дальше →
        </Link>
      ) : null}
    </nav>
  )
}
