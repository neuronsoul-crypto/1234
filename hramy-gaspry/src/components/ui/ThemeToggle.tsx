'use client'
import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

import { readPref, writePref } from '@/lib/prefs'
import { useClientValue } from '@/lib/use-client-value'

const systemOrSaved = () => {
  const saved = readPref('hg-theme')
  return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Светлая / тёмная тема. По умолчанию — как в системе. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const initial = useClientValue(systemOrSaved, false)
  const [override, setOverride] = useState<boolean | null>(null)
  const dark = override ?? initial

  const toggle = () => {
    const next = !dark
    setOverride(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    writePref('hg-theme', next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`tap inline-flex items-center justify-center rounded-btn hover:bg-ink/5 ${className}`}
      aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
    >
      {dark ? <Sun size={20} strokeWidth={1.5} aria-hidden /> : <Moon size={20} strokeWidth={1.5} aria-hidden />}
    </button>
  )
}
