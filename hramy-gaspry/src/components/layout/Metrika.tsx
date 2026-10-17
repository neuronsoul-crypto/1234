'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { readPref, writePref } from '@/lib/prefs'
import { useClientValue } from '@/lib/use-client-value'

/**
 * Яндекс.Метрика подключается только после согласия посетителя (152-ФЗ, cookie-баннер).
 */
export function Metrika({ id }: { id?: string }) {
  // undefined — ещё не знаем (сервер), null — посетитель не выбирал
  const saved = useClientValue<string | null | undefined>(() => readPref('hg-cookie'), undefined)
  const [override, setConsent] = useState<string | null>(null)
  const consent = override ?? saved

  useEffect(() => {
    if (!id || consent !== 'yes') return
    const w = window as unknown as { ym?: (...args: unknown[]) => void } & Record<string, unknown>
    if (w.ym) return
    const s = document.createElement('script')
    s.innerHTML = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${Number(id)},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});`
    document.head.appendChild(s)
  }, [id, consent])

  if (!id || consent !== null) return null

  const choose = (value: 'yes' | 'no') => {
    writePref('hg-cookie', value)
    setConsent(value)
  }

  return (
    <div
      data-cookie
      role="region"
      aria-label="Согласие на cookie"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface"
    >
      <div className="container-site flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-small text-ink-2 measure">
          Мы используем cookie и Яндекс.Метрику, чтобы понимать, чем сайт полезен прихожанам. Подробнее — в{' '}
          <Link href="/politika" className="text-lazur underline">
            политике обработки данных
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose('no')} className="tap rounded-btn border border-line px-4 text-[1rem]">
            Отказаться
          </button>
          <button type="button" onClick={() => choose('yes')} className="tap rounded-btn bg-lazur px-4 text-[1rem] text-lazur-ink">
            Согласен
          </button>
        </div>
      </div>
    </div>
  )
}
