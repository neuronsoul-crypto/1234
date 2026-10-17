'use client'
import { useState } from 'react'

import { readPref, writePref } from '@/lib/prefs'
import { useClientValue } from '@/lib/use-client-value'

const SIZES = [
  { value: '0', label: 'A', title: 'Обычный шрифт' },
  { value: '1', label: 'A+', title: 'Крупный шрифт' },
  { value: '2', label: 'A++', title: 'Очень крупный шрифт' },
]

/** Переключатель размера шрифта A / A+ / A++ (запоминается). */
export function FontSizeToggle({ className = '' }: { className?: string }) {
  const saved = useClientValue(() => readPref('hg-fs') ?? '0', '0')
  const [override, setSize] = useState<string | null>(null)
  const size = override ?? saved

  const choose = (value: string) => {
    setSize(value)
    const root = document.documentElement
    if (value === '0') root.removeAttribute('data-fs')
    else root.setAttribute('data-fs', value)
    writePref('hg-fs', value === '0' ? null : value)
  }

  return (
    <div role="group" aria-label="Размер шрифта" className={`inline-flex items-center ${className}`}>
      {SIZES.map((s, i) => (
        <button
          key={s.value}
          type="button"
          onClick={() => choose(s.value)}
          aria-pressed={size === s.value}
          title={s.title}
          className={`tap inline-flex items-center justify-center rounded-btn px-1.5 font-medium hover:bg-ink/5 ${size === s.value ? 'text-lazur underline underline-offset-4' : 'text-ink-2'}`}
          style={{ fontSize: `${0.875 + i * 0.125}rem` }}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
