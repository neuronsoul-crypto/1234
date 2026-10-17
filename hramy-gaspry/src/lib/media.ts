import type { LightboxPhoto } from '@/components/ui/Lightbox'
import type { Media } from '@/payload-types'

export const toPhoto = (m: Media): LightboxPhoto => {
  const card = m.sizes?.card
  const hero = m.sizes?.hero
  const credit = [m.author && `Фото: ${m.author}`, m.year, m.source && `Источник: ${m.source}`].filter(Boolean).join(' · ')
  return {
    id: m.id,
    src: hero?.url || m.url || '',
    full: m.url || '',
    width: card?.width || m.width || 960,
    height: card?.height || m.height || 640,
    alt: m.alt || m.caption || 'Фото',
    caption: m.caption ?? undefined,
    credit: credit || undefined,
  }
}

export const mediaList = (list: Array<number | Media> | null | undefined): Media[] =>
  (list ?? []).filter((m): m is Media => typeof m === 'object' && m !== null && Boolean(m.url))
