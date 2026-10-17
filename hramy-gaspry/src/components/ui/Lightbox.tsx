'use client'
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef } from 'react'

export type LightboxPhoto = {
  id: number | string
  src: string
  full: string
  width: number
  height: number
  alt: string
  caption?: string
  credit?: string
}

/** Просмотр фото: клавиатура (← → Esc), свайпы, подписи, «Скачать» по разрешению альбома. */
export function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
  allowDownload,
}: {
  photos: LightboxPhoto[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
  allowDownload?: boolean
}) {
  const photo = photos[index]
  const closeRef = useRef<HTMLButtonElement>(null)
  const touch = useRef<number | null>(null)

  const prev = useCallback(() => onIndex((index - 1 + photos.length) % photos.length), [index, photos.length, onIndex])
  const next = useCallback(() => onIndex((index + 1) % photos.length), [index, photos.length, onIndex])

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previouslyFocused?.focus()
    }
  }, [onClose, prev, next])

  if (!photo) return null
  const btn = 'tap inline-flex items-center justify-center rounded-btn text-[#efe9dd] hover:bg-white/10'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Фото ${index + 1} из ${photos.length}`}
      className="fixed inset-0 z-[60] flex flex-col bg-[#14130f]/95 text-[#efe9dd]"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)()
        touch.current = null
      }}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <span className="text-small opacity-80">
          {index + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-1">
          {allowDownload ? (
            <a href={photo.full} download className={`${btn} gap-2 px-3 text-small`}>
              <Download size={18} strokeWidth={1.5} aria-hidden /> Скачать
            </a>
          ) : null}
          <button ref={closeRef} type="button" onClick={onClose} className={btn} aria-label="Закрыть">
            <X size={24} strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        <div className="relative h-full w-full">
          <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-contain" priority />
        </div>
        {photos.length > 1 ? (
          <>
            <button type="button" onClick={prev} className={`${btn} absolute left-2 top-1/2 -translate-y-1/2`} aria-label="Предыдущее фото">
              <ChevronLeft size={32} strokeWidth={1.5} aria-hidden />
            </button>
            <button type="button" onClick={next} className={`${btn} absolute right-2 top-1/2 -translate-y-1/2`} aria-label="Следующее фото">
              <ChevronRight size={32} strokeWidth={1.5} aria-hidden />
            </button>
          </>
        ) : null}
      </div>
      <div className="min-h-16 px-4 py-3 text-center text-small">
        {photo.caption ? <p>{photo.caption}</p> : null}
        {photo.credit ? <p className="opacity-70">{photo.credit}</p> : null}
      </div>
    </div>
  )
}
