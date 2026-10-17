import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold'

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-btn px-5 py-2.5 text-[1rem] font-medium leading-tight no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-lazur text-lazur-ink hover:bg-lazur/90',
  secondary: 'border border-ink/70 text-ink hover:border-ink hover:bg-ink/5',
  ghost: 'text-lazur underline decoration-line underline-offset-4 hover:decoration-current px-2',
  gold: 'bg-gold text-[#1c1a17] hover:bg-gold/90',
}

export const buttonClass = (variant: Variant = 'primary', extra = '') => `${base} ${variants[variant]} ${extra}`

type LinkProps = { href: string; variant?: Variant; children: ReactNode; className?: string; external?: boolean } & Omit<
  ComponentProps<'a'>,
  'href'
>

export function ButtonLink({ href, variant = 'primary', children, className = '', external, ...rest }: LinkProps) {
  if (external || /^(https?:|tel:|mailto:)/.test(href)) {
    return (
      <a href={href} className={buttonClass(variant, className)} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={buttonClass(variant, className)} {...rest}>
      {children}
    </Link>
  )
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}: ComponentProps<'button'> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />
}
