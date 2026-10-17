import type { Block } from 'payload'
import {
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Галерея', plural: 'Галереи' },
  fields: [
    {
      name: 'images',
      label: 'Фотографии',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      admin: { description: 'Перетащите несколько фото сразу. Порядок меняется перетаскиванием.' },
    },
    { name: 'caption', label: 'Подпись к галерее', type: 'text' },
  ],
}

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Видео (VK / Rutube)', plural: 'Видео' },
  fields: [
    {
      name: 'url',
      label: 'Ссылка на видео',
      type: 'text',
      required: true,
      admin: { description: 'Скопируйте адрес видео из VK Видео или Rutube.' },
      validate: (value: string | null | undefined) =>
        !value || /(vk\.com|vkvideo\.ru|rutube\.ru)/.test(value) || 'Поддерживаются ссылки VK Видео и Rutube',
    },
    { name: 'caption', label: 'Подпись', type: 'text' },
  ],
}

/**
 * Ограниченный набор инструментов: без цветов и шрифтов, чтобы сайт «не разъехался».
 */
export const editorWithMedia = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({ enabledCollections: ['posts', 'pages'] }),
    BlockquoteFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    UploadFeature({
      collections: { media: { fields: [{ name: 'caption', label: 'Подпись', type: 'text' }] } },
    }),
    BlocksFeature({ blocks: [GalleryBlock, VideoBlock] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

/** Простой текст без фото — для коротких описаний. */
export const editorSimple = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h3'] }),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({}),
    UnorderedListFeature(),
    OrderedListFeature(),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
