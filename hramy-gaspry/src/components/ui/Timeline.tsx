type Item = { year: string; title: string; text?: string | null }

/** Хронология: год — событие. */
export function Timeline({ items }: { items: Item[] }) {
  return (
    <ol className="relative space-y-10 border-l border-line pl-8">
      {items.map((item, i) => (
        <li key={i} className="relative">
          <span aria-hidden className="absolute -left-[2.3rem] top-3 size-3 rotate-45 border border-gold bg-bg" />
          <p className="font-display text-[2rem] font-semibold leading-none text-gold-ink">{item.year}</p>
          <p className="mt-2 text-[1.125rem] font-medium">{item.title}</p>
          {item.text ? <p className="mt-1 text-ink-2 measure">{item.text}</p> : null}
        </li>
      ))}
    </ol>
  )
}
