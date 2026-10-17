import Link from 'next/link'

/** Фильтры-ссылки (работают без JavaScript, адрес можно переслать). */
export function FilterLinks({
  label,
  options,
  current,
  hrefFor,
}: {
  label: string
  options: Array<{ value: string; label: string }>
  current: string
  hrefFor: (value: string) => string
}) {
  const chip = (active: boolean) =>
    `tap inline-flex items-center rounded-full border px-4 text-[1rem] no-underline ${active ? 'border-ink bg-ink text-bg' : 'border-line hover:border-ink'}`
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-small text-ink-2">{label}:</span>
      {[{ value: '', label: 'Все' }, ...options].map((o) => (
        <Link key={o.value || 'all'} href={hrefFor(o.value)} className={chip(current === o.value)} aria-current={current === o.value ? 'true' : undefined} scroll={false}>
          {o.label}
        </Link>
      ))}
    </div>
  )
}

export const buildQuery = (base: string, params: Record<string, string | number | undefined>) => {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '' && v !== 1) qs.set(k, String(v))
  const s = qs.toString()
  return s ? `${base}?${s}` : base
}
