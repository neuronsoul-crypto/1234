import Image from 'next/image'

import type { Media } from '@/payload-types'

import { LogoMark } from './Logo'

type Size = 'thumb' | 'card' | 'hero' | 'original'

type Props = {
  media?: Media | null
  size?: Size
  className?: string
  sizes?: string
  priority?: boolean
  fill?: boolean
  alt?: string
}

/** Фото из медиатеки: next/image (AVIF/WebP), ленивая загрузка, точка фокуса. */
export function Img({ media, size = 'card', className, sizes, priority, fill = true, alt }: Props) {
  if (!media?.url) return <ImgPlaceholder className={className} />
  const variant = size !== 'original' ? media.sizes?.[size] : undefined
  const src = variant?.url || media.url
  const width = variant?.width || media.width || 1600
  const height = variant?.height || media.height || 1067
  const objectPosition =
    typeof media.focalX === 'number' && typeof media.focalY === 'number'
      ? `${media.focalX}% ${media.focalY}%`
      : '50% 50%'

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt ?? media.alt ?? ''}
        fill
        sizes={sizes ?? '(min-width: 1024px) 33vw, 100vw'}
        priority={priority}
        className={`object-cover ${className ?? ''}`}
        style={{ objectPosition }}
      />
    )
  }
  return (
    <Image
      src={src}
      alt={alt ?? media.alt ?? ''}
      width={width}
      height={height}
      sizes={sizes ?? '(min-width: 1024px) 33vw, 100vw'}
      priority={priority}
      className={className}
      style={{ objectPosition }}
    />
  )
}

/** Заглушка, пока нет фото: известняк и знак. */
export function ImgPlaceholder({ className, label = 'Фото появится позже' }: { className?: string; label?: string }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gold-soft/60 text-ink-2 ${className ?? ''}`}
      role="img"
      aria-label={label}
    >
      <LogoMark size={40} />
      <span className="text-small">{label}</span>
    </div>
  )
}
