import type { CollectionConfig } from 'payload'

import { allow, publishedOrLoggedIn } from '@/access/roles'
import { editorWithMedia } from '@/blocks/richtext'
import { slugField } from '@/fields/slug'
import { auditHooks } from '@/hooks/audit'
import { POST_CATEGORIES } from '@/lib/constants'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { postToTelegram } from '@/hooks/telegram-post'
import { absoluteUrl } from '@/lib/site'

const audit = auditHooks('posts', 'title')

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Новость', plural: 'Новости' },
  admin: {
    useAsTitle: 'title',
    group: 'Материалы',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    listSearchableFields: ['title', 'lead'],
    livePreview: { url: ({ data }) => absoluteUrl(`/predprosmotr?type=posts&slug=${data?.slug ?? ''}`) },
    preview: (doc) => absoluteUrl(`/predprosmotr?type=posts&slug=${doc?.slug ?? ''}`),
  },
  defaultSort: '-publishedAt',
  trash: true,
  access: {
    read: publishedOrLoggedIn,
    create: allow('admin', 'editor'),
    update: allow('admin', 'editor'),
    delete: allow('admin', 'editor'),
  },
  versions: {
    drafts: { autosave: { interval: 2000 }, schedulePublish: true },
    maxPerDoc: 30,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data._status === 'published' && !data.publishedAt) data.publishedAt = new Date().toISOString()
        return data
      },
    ],
    afterChange: [...(audit.afterChange ?? []), revalidateAfterChange, postToTelegram],
    afterDelete: [...(audit.afterDelete ?? []), revalidateAfterDelete],
  },
  fields: [
    { name: 'title', label: 'Заголовок', type: 'text', required: true },
    {
      name: 'lead',
      label: 'Коротко (1–2 предложения)',
      type: 'textarea',
      admin: { description: 'Показывается в списке новостей и в Telegram.' },
    },
    {
      name: 'cover',
      label: 'Обложка',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Главное фото новости. Точку фокуса можно указать в самом фото.' },
    },
    { name: 'content', label: 'Текст новости', type: 'richText', editor: editorWithMedia },
    {
      name: 'album',
      label: 'Связанный фотоальбом',
      type: 'relationship',
      relationTo: 'albums',
    },
    {
      name: 'category',
      label: 'Рубрика',
      type: 'select',
      required: true,
      defaultValue: 'obyavlenie',
      options: POST_CATEGORIES,
      admin: { position: 'sidebar' },
    },
    {
      name: 'church',
      label: 'Храм (если касается одного)',
      type: 'relationship',
      relationTo: 'churches',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: 'Дата публикации',
      type: 'date',
      index: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMMM yyyy, HH:mm' } },
    },
    {
      name: 'sendToTelegram',
      label: 'Отправить в Telegram-канал',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Новость уйдёт в канал один раз — при публикации.' },
    },
    {
      name: 'telegramSentAt',
      label: 'Отправлено в Telegram',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    slugField('title'),
  ],
}
