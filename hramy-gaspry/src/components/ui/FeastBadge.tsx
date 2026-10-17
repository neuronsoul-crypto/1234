const LABELS: Record<string, string> = {
  twelve: 'Двунадесятый праздник',
  great: 'Великий праздник',
  pascha: 'Праздников праздник',
}

export function FeastBadge({ rank, className = '' }: { rank: string; className?: string }) {
  if (!LABELS[rank]) return null
  const tone =
    rank === 'great'
      ? 'border-gold text-gold-ink'
      : 'border-feast text-feast'
  return (
    <span
      className={`inline-flex items-center rounded-btn border px-2 py-0.5 text-[0.8125rem] font-medium uppercase tracking-[0.04em] ${tone} ${className}`}
    >
      {LABELS[rank]}
    </span>
  )
}
