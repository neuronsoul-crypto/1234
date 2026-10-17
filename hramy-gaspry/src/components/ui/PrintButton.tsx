'use client'
import { Printer } from 'lucide-react'

export function PrintButton({ label = 'Распечатать' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="tap inline-flex items-center gap-2 rounded-btn border border-line px-4 text-[1rem] hover:border-ink"
    >
      <Printer size={18} strokeWidth={1.5} aria-hidden /> {label}
    </button>
  )
}
