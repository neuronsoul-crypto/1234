const DOT: Record<string, string> = {
  nina: 'bg-nina',
  stena: 'bg-stena',
  gold: 'bg-gold',
}

/** Цветная метка храма: точка цвета храма + название (текст — основным цветом, ради контраста). */
export function ChurchTag({ color, children, className = '' }: { color: string; children: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-small text-ink-2 ${className}`}>
      <span aria-hidden className={`inline-block size-2.5 shrink-0 rounded-full ${DOT[color] ?? 'bg-ink-2'}`} />
      {children}
    </span>
  )
}

export const churchStripe = (color: string) =>
  color === 'nina' ? 'border-nina' : color === 'stena' ? 'border-stena' : 'border-gold'
