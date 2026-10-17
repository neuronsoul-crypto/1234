import type { CollectionConfig } from 'payload'

import { allow, publishedOrLoggedIn } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { auditHooks } from '@/hooks/audit'
import { ALBUM_TYPES } from '@/lib/constants'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

const audit = auditHooks('albums', 'title')

export const Albums: CollectionConfig = {
  slug: 'albums',
  labels: { singular: 'Фотоальбом', plural: 'Фотоархив' },
  admin: {
    useAsTitle: 'title',
    group: 'Материалы',
    defaultColumns: ['title', 'date', 'type', 'church', '_status'],
  },
  defaultSort: '-date',
  trash: true,
  access: {
    read: publishedOrLoggedIn,
    create: allow('admin', 'editor'),
    update: allow('admin', 'editor'),
    delete: allow('admin', 'editor'),
  },
  versions: { drafts: true, maxPerDoc: 10 },
  hooks: {
    afterChange: [...(audit.afterChange ?? []), revalidateAfterChange],
    afterDelete: [...(audit.afterDelete ?? []), revalidateAfterDelete],
  },
  fields: [
    { name: 'title', label: 'Название альбома', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          label: 'Дата события',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' } },
        },
        {
          name: 'type',
          label: 'Тип',
          type: 'select',
          required: true,
          defaultValue: 'bogosluzhenie',
          options: ALBUM_TYPES,
        },
      ],
    },
    { name: 'church', label: 'Храм', type: 'relationship', relationTo: 'churches' },
    { name: 'description', label: 'Описание', type: 'textarea' },
    {
      name: 'photos',
      label: 'Фотографии',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description:
          'Перетащите сюда сразу все фото (до 200 за раз) — они сожмутся автоматически. Порядок меняется перетаскиванием. Подписи — по желанию, в самом фото.',
      },
    },
    {
      name: 'cover',
      label: 'Обложка',
      type: 'upload',
      relationTo: 'media',
      admin: { position: 'sidebar', description: 'Если не выбрать — возьмём первое фото альбома.' },
    },
    {
      name: 'allowDownload',
      label: 'Разрешить скачивание фото',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    slugField('title'),
  ],
}
