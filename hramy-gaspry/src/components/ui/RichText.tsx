import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

import { mediaList, toPhoto } from '@/lib/media'
import type { Media } from '@/payload-types'

import { PhotoGrid } from './PhotoGrid'

/** VK Видео и Rutube → адрес для встраивания. */
export function videoEmbedUrl(url: string): string | null {
  const rutube = url.match(/rutube\.ru\/(?:video|play\/embed)\/([a-z0-9]+)/i)
  if (rutube) return `https://rutube.ru/play/embed/${rutube[1]}`
  const vk = url.match(/video(-?\d+)_(\d+)/)
  if (vk) return `https://vk.com/video_ext.php?oid=${vk[1]}&id=${vk[2]}&hd=2`
  if (/video_ext\.php/.test(url)) return url
  return null
}

const internalHref = ({ linkNode }: { linkNode: { fields: { doc?: { relationTo?: string; value?: unknown } } } }) => {
  const doc = linkNode.fields.doc
  const value = doc?.value as { slug?: string } | undefined
  if (!value?.slug) return '/'
  return doc?.relationTo === 'posts' ? `/novosti/${value.slug}` : `/${value.slug}`
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref: internalHref as never }),
  upload: ({ node }) => {
    const m = (node as unknown as { value?: Media; fields?: { caption?: string } }).value
    if (!m || typeof m !== 'object' || !m.url || !m.mimeType?.startsWith('image')) {
      return m?.url ? (
        <a href={m.url} className="text-lazur underline">
          {m.filename}
        </a>
      ) : null
    }
    const caption = (node as unknown as { fields?: { caption?: string } }).fields?.caption || m.caption
    return (
      <figure className="my-8">
        <Image
          src={m.sizes?.hero?.url || m.url}
          alt={m.alt || caption || ''}
          width={m.sizes?.hero?.width || m.width || 1600}
          height={m.sizes?.hero?.height || m.height || 1000}
          sizes="(min-width: 768px) 720px, 100vw"
          className="h-auto w-full"
        />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    )
  },
  blocks: {
    gallery: ({ node }: { node: { fields: unknown } }) => {
      const fields = node.fields as unknown as { images?: Array<number | Media>; caption?: string }
      const photos = mediaList(fields.images).map(toPhoto)
      return (
        <figure className="not-prose my-10 max-w-none">
          <PhotoGrid photos={photos} />
          {fields.caption ? <figcaption>{fields.caption}</figcaption> : null}
        </figure>
      )
    },
    video: ({ node }: { node: { fields: unknown } }) => {
      const fields = node.fields as unknown as { url?: string; caption?: string }
      const src = fields.url ? videoEmbedUrl(fields.url) : null
      if (!src) return null
      return (
        <figure className="my-10">
          <div className="relative aspect-video bg-surface">
            <iframe
              src={src}
              title={fields.caption || 'Видео'}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              allowFullScreen
            />
          </div>
          {fields.caption ? <figcaption>{fields.caption}</figcaption> : null}
        </figure>
      )
    },
  },
})

export function RichText({ data, className = '' }: { data?: unknown; className?: string }) {
  if (!data || typeof data !== 'object') return null
  return (
    <LexicalRichText
      data={data as SerializedEditorState}
      converters={converters}
      className={`prose-site ${className}`}
      disableIndent
      disableTextAlign
    />
  )
}
