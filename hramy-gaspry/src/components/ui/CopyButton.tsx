'use client'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { Toast } from './Toast'

export function CopyButton({ value, label = 'Скопировать', className = '' }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
  }
  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={`tap inline-flex items-center gap-1.5 rounded-btn px-2 text-small text-lazur hover:bg-lazur/5 ${className}`}
      >
        {copied ? <Check size={16} strokeWidth={1.5} aria-hidden /> : <Copy size={16} strokeWidth={1.5} aria-hidden />}
        {copied ? 'Скопировано' : label}
      </button>
      {copied ? <Toast message="Скопировано" onClose={() => setCopied(false)} /> : null}
    </>
  )
}
