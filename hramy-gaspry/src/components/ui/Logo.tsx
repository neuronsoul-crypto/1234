type MarkProps = { size?: number; className?: string; title?: string }

/**
 * Знак: крест святой Нины (с опущенными, «виноградными» концами) внутри арки-стены.
 * Монохромный, рисуется цветом текста (currentColor), читается от 16 px.
 */
export function LogoMark({ size = 32, className, title }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* арка */}
      <path d="M6 29V14a10 10 0 0 1 20 0v15" />
      <path d="M3.5 29h25" />
      {/* крест св. Нины: вертикаль и перекладина с опущенными концами */}
      <path d="M16 8v18" />
      <path d="M9.5 15.6c2.4-1.7 4.4-2.6 6.5-2.6s4.1.9 6.5 2.6" />
    </svg>
  )
}

export function Logo({ name = 'Храмы Гаспры', compact = false }: { name?: string; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark size={compact ? 28 : 34} />
      <span className="font-display text-[1.375rem] font-semibold leading-none tracking-tight">{name}</span>
    </span>
  )
}
