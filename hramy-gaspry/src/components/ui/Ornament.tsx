/**
 * Разделитель-плетёнка: две переплетающиеся нити с ромбом в центре.
 * Оригинальный рисунок по мотивам кавказской резьбы по камню.
 */
export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 text-gold ${className}`} aria-hidden>
      <svg className="h-3 flex-1" preserveAspectRatio="none" viewBox="0 0 240 12">
        <defs>
          <pattern id="braid" width="24" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 6 C6 0, 6 0, 12 6 S18 12, 24 6" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M0 6 C6 12, 6 12, 12 6 S18 0, 24 6" fill="none" stroke="currentColor" strokeWidth="1" opacity=".55" />
          </pattern>
        </defs>
        <rect width="240" height="12" fill="url(#braid)" />
      </svg>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M14 2 26 14 14 26 2 14Z" />
        <path d="M14 8 20 14 14 20 8 14Z" />
        <circle cx="14" cy="14" r="1.6" fill="currentColor" />
      </svg>
      <svg className="h-3 flex-1 -scale-x-100" preserveAspectRatio="none" viewBox="0 0 240 12">
        <rect width="240" height="12" fill="url(#braid)" />
      </svg>
    </div>
  )
}
