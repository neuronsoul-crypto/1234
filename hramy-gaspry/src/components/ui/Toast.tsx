'use client'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

/** Короткое всплывающее сообщение. Объявляется для экранных дикторов. */
export function Toast({ message, tone = 'success', onClose }: { message: string; tone?: 'success' | 'error'; onClose?: () => void }) {
  const [open, setOpen] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => {
      setOpen(false)
      onClose?.()
    }, 4000)
    return () => clearTimeout(t)
  }, [onClose])
  if (!open) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 border bg-surface px-4 py-3 text-[1rem] sm:inset-x-auto sm:right-6 ${tone === 'success' ? 'border-nina' : 'border-feast'}`}
    >
      {tone === 'success' ? (
        <CheckCircle2 size={20} strokeWidth={1.5} className="shrink-0 text-nina" aria-hidden />
      ) : (
        <AlertCircle size={20} strokeWidth={1.5} className="shrink-0 text-feast" aria-hidden />
      )}
      {message}
    </div>
  )
}
