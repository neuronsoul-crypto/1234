import Link from 'next/link'

/** Метка-путь в духе «/расписание» — элемент навигации и дизайна. */
export function PathLabel({ children, href, className = '' }: { children: string; href?: string; className?: string }) {
  const text = children.startsWith('/') ? children : `/${children}`
  if (href)
    return (
      <Link href={href} className={`path-label link-underline hover:text-ink ${className}`}>
        {text}
      </Link>
    )
  return <span className={`path-label ${className}`}>{text}</span>
}
