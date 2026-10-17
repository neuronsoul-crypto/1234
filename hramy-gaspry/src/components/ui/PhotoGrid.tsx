'use client'
import Image from 'next/image'
import { useState } from 'react'

import { Lightbox, type LightboxPhoto } from './Lightbox'

/** Masonry-сетка с открытием в лайтбоксе. Ленивая загрузка — через next/image. */
export function PhotoGrid({
  photos,
  allowDownload,
  variant = 'masonry',
}: {
  photos: LightboxPhoto[]
  allowDownload?: boolean
  variant?: 'masonry' | 'strip'
}) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <>
      <div className={variant === 'masonry' ? 'masonry' : 'no-scrollbar -mx-[var(--gutter)] flex snap-x gap-4 overflow-x-auto px-[var(--gutter)] pb-2'}>
        {photos.map((p, i) => (
          <figure key={p.id} className={variant === 'strip' ? 'w-64 shrink-0 snap-start sm:w-80' : ''}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full overflow-hidden bg-surface"
              aria-label={`Открыть фото: ${p.alt}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={p.width}
                height={p.height}
                sizes={variant === 'strip' ? '320px' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
                className={`w-full transition-opacity group-hover:opacity-90 ${variant === 'strip' ? 'aspect-[4/5] object-cover' : 'h-auto'}`}
              />
            </button>
            {p.caption && variant === 'masonry' ? <figcaption className="mt-2 text-small text-ink-2">{p.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
      {open !== null ? (
        <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} allowDownload={allowDownload} />
      ) : null}
    </>
  )
}
