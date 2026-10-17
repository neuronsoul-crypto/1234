import Image from 'next/image'

import type { Media, Setting } from '@/payload-types'

import { ButtonLink } from './Button'
import { CopyButton } from './CopyButton'

const rub = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽'

export function CampaignProgress({ settings }: { settings: Setting }) {
  const c = settings.campaign
  if (!c?.enabled || !c.title) return null
  const goal = c.goal ?? 0
  const collected = c.collected ?? 0
  const percent = goal ? Math.min(100, Math.round((collected / goal) * 100)) : 0
  return (
    <div className="border border-line bg-surface p-6">
      <p className="path-label">/сбор</p>
      <h3 className="mt-2 text-h3">{c.title}</h3>
      {c.description ? <p className="mt-2 text-ink-2 measure">{c.description}</p> : null}
      {goal ? (
        <>
          <div
            className="mt-5 h-2.5 overflow-hidden rounded-full bg-gold-soft"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={collected}
            aria-label="Собрано"
          >
            <div className="h-full bg-gold" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 flex justify-between text-small text-ink-2">
            <span>
              Собрано <b className="text-ink">{rub(collected)}</b>
            </span>
            <span>из {rub(goal)}</span>
          </p>
        </>
      ) : null}
    </div>
  )
}

/** QR СБП + реквизиты с кнопками «Скопировать». */
export function DonateBlock({ settings, compact = false }: { settings: Setting; compact?: boolean }) {
  const qr = settings.sbpQr && typeof settings.sbpQr === 'object' ? (settings.sbpQr as Media) : undefined
  const r = settings.requisites
  const rows: Array<[string, string | null | undefined]> = [
    ['Получатель', r?.recipient],
    ['ИНН', r?.inn],
    ['КПП', r?.kpp],
    ['Расчётный счёт', r?.account],
    ['Банк', r?.bank],
    ['БИК', r?.bik],
    ['Корр. счёт', r?.corrAccount],
    ['Назначение', r?.purpose],
  ]
  const filled = rows.filter(([, v]) => v)
  const allText = filled.map(([k, v]) => `${k}: ${v}`).join('\n')

  return (
    <div className={`grid gap-8 ${compact ? 'md:grid-cols-[12rem_1fr]' : 'md:grid-cols-[16rem_1fr]'}`}>
      <div>
        <div className="relative aspect-square w-full max-w-64 border border-line bg-white p-3">
          {qr?.url ? (
            <Image src={qr.url} alt="QR-код для пожертвования через СБП" fill className="object-contain p-3" sizes="256px" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-small text-[#5e5850]">
              <svg viewBox="0 0 48 48" className="size-16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect x="4" y="4" width="14" height="14" />
                <rect x="30" y="4" width="14" height="14" />
                <rect x="4" y="30" width="14" height="14" />
                <path d="M30 30h6v6h-6zM38 38h6v6h-6zM38 30h6M30 44h4" />
              </svg>
              QR-код СБП будет добавлен
            </div>
          )}
        </div>
        <p className="mt-3 text-small text-ink-2">Наведите камеру телефона или откройте в приложении банка.</p>
        {settings.sbpLink ? (
          <ButtonLink href={settings.sbpLink} external className="mt-4 w-full max-w-64" variant="gold">
            Пожертвовать через СБП
          </ButtonLink>
        ) : null}
      </div>
      <div>
        <h3 className="text-h3">Реквизиты прихода</h3>
        {filled.length ? (
          <>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {filled.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-4">
                  <dt className="text-small text-ink-2">{k}</dt>
                  <dd className="break-words font-medium lining-nums tabular-nums">{v}</dd>
                  <dd className="no-print">
                    <CopyButton value={String(v)} />
                  </dd>
                </div>
              ))}
            </dl>
            <div className="no-print mt-3">
              <CopyButton value={allText} label="Скопировать все реквизиты" />
            </div>
          </>
        ) : (
          <p className="mt-3 text-ink-2">Реквизиты будут опубликованы в ближайшее время.</p>
        )}
      </div>
    </div>
  )
}
