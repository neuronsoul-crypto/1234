import { Mail, Phone, Send } from 'lucide-react'
import Link from 'next/link'

import { FontSizeToggle } from '@/components/ui/FontSizeToggle'
import { LogoMark } from '@/components/ui/Logo'
import { Ornament } from '@/components/ui/Ornament'
import { NAV } from '@/lib/nav'
import type { Church, Setting } from '@/payload-types'

export function Footer({ settings, churches }: { settings: Setting; churches: Church[] }) {
  const r = settings.requisites
  return (
    <footer data-site-footer className="mt-32 border-t border-line bg-surface">
      <div className="container-site py-16">
        <Ornament className="mb-14" />
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark size={36} />
              <span className="font-display text-[1.5rem] font-semibold">{settings.siteName}</span>
            </div>
            <p className="mt-4 text-small text-ink-2">{settings.parishName}</p>
          </div>

          <div>
            <h2 className="path-label">/адреса</h2>
            <ul className="mt-4 space-y-4">
              {churches.map((c) => (
                <li key={c.id}>
                  <Link href={`/hramy/${c.slug}`} className="link-underline font-medium">
                    {c.name}
                  </Link>
                  <p className="text-small text-ink-2">{c.address}</p>
                </li>
              ))}
            </ul>
            {settings.shopHours ? <p className="mt-4 whitespace-pre-line text-small text-ink-2">{settings.shopHours}</p> : null}
          </div>

          <div>
            <h2 className="path-label">/связаться</h2>
            <ul className="mt-4 space-y-2">
              {(settings.phones ?? []).map((p) => (
                <li key={p.id ?? p.number}>
                  <a href={`tel:${p.number.replace(/[^\d+]/g, '')}`} className="tap inline-flex items-center gap-2 link-underline">
                    <Phone size={16} strokeWidth={1.5} aria-hidden /> {p.number}
                  </a>
                  {p.label ? <span className="ml-2 text-small text-ink-2">{p.label}</span> : null}
                </li>
              ))}
              {settings.email ? (
                <li>
                  <a href={`mailto:${settings.email}`} className="tap inline-flex items-center gap-2 link-underline">
                    <Mail size={16} strokeWidth={1.5} aria-hidden /> {settings.email}
                  </a>
                </li>
              ) : null}
              {settings.telegram ? (
                <li>
                  <a href={settings.telegram} className="tap inline-flex items-center gap-2 link-underline" target="_blank" rel="noopener noreferrer">
                    <Send size={16} strokeWidth={1.5} aria-hidden /> Telegram-канал
                  </a>
                </li>
              ) : null}
              {settings.vk ? (
                <li>
                  <a href={settings.vk} className="tap inline-flex items-center gap-2 link-underline" target="_blank" rel="noopener noreferrer">
                    ВКонтакте
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <nav aria-label="Разделы сайта">
            <h2 className="path-label">/разделы</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-small lg:grid-cols-1">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="inline-flex min-h-9 items-center link-underline">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-small text-ink-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            {r?.recipient ? <p>{r.recipient}</p> : null}
            {r?.inn || r?.ogrn ? (
              <p>
                {r.inn ? `ИНН ${r.inn}` : ''} {r.ogrn ? `· ОГРН ${r.ogrn}` : ''}
              </p>
            ) : null}
            <p>
              <Link href="/politika" className="link-underline">
                Политика обработки персональных данных
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span>Размер шрифта:</span>
            <FontSizeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
