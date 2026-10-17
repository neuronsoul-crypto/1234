'use client'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { FontSizeToggle } from '@/components/ui/FontSizeToggle'
import { NAV } from '@/lib/nav'

/** Полноэкранное меню: крупные пункты, под каждым — строка пояснения. */
export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const closeRef = useRef<HTMLButtonElement>(null)
  const openRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const opener = openRef.current
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      opener?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={openRef}
        type="button"
        onClick={() => setOpen(true)}
        className="tap inline-flex items-center justify-center gap-2 rounded-btn px-2 hover:bg-ink/5"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label="Меню сайта"
      >
        <Menu size={24} strokeWidth={1.5} aria-hidden />
        <span className="hidden text-[1rem] md:inline">Меню</span>
      </button>
      {open ? (
        <div id="site-menu" role="dialog" aria-modal="true" aria-label="Меню сайта" className="fixed inset-0 z-50 overflow-y-auto bg-bg">
          <div className="container-site flex h-[4.5rem] items-center justify-between">
            <FontSizeToggle />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="tap inline-flex items-center gap-2 rounded-btn px-2 hover:bg-ink/5"
            >
              <span className="text-[1rem]">Закрыть</span>
              <X size={24} strokeWidth={1.5} aria-hidden />
            </button>
          </div>
          <nav aria-label="Все разделы" className="container-site pb-16 pt-4">
            <ul className="grid gap-x-12 md:grid-cols-2">
              {NAV.map((item) => (
                <li key={item.href} className="border-t border-line">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group block py-4 no-underline"
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    <span className="path-label block">{item.path}</span>
                    <span className="mt-1 block font-display text-[2.25rem] font-semibold leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-8">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-ink-2">{item.hint}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  )
}
