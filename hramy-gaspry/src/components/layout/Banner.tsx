import Link from 'next/link'

import { isPast } from '@/lib/dates'
import type { Setting } from '@/payload-types'

/** Объявление-полоса вверху страниц (включается в «Настройках» или с главного экрана админки). */
export function Banner({ settings }: { settings: Setting }) {
  const b = settings.banner
  if (!b?.enabled || !b.text) return null
  if (b.until && isPast(b.until)) return null
  const inner = <span className="font-medium">{b.text}</span>
  return (
    <div data-banner className="bg-gold-soft text-ink">
      <div className="container-site flex min-h-11 items-center justify-center py-2 text-center text-[1rem]">
        {b.link ? (
          <Link href={b.link} className="underline underline-offset-4">
            {inner}
          </Link>
        ) : (
          inner
        )}
      </div>
    </div>
  )
}
