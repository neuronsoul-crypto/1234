import Link from 'next/link'

import { ButtonLink } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { HEADER_NAV } from '@/lib/nav'

import { MobileMenu } from './MobileMenu'

export function Header({ siteName }: { siteName: string }) {
  return (
    <header data-site-header className="relative z-30 border-b border-line bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:bg-surface focus:px-4 focus:py-2"
      >
        Перейти к содержанию
      </a>
      <div className="container-site flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="inline-flex min-h-11 items-center no-underline" aria-label={`${siteName} — на главную`}>
          <Logo name={siteName} />
        </Link>
        <nav aria-label="Основное меню" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {HEADER_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center px-3 text-[1rem] link-underline no-underline hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <span className="hidden sm:inline-flex">
            <ButtonLink href="/pozhertvovaniya" variant="gold">
              Пожертвовать
            </ButtonLink>
          </span>
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
