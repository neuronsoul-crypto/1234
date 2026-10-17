import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { allow, anyone } from '@/access/roles'
import { auditHooks } from '@/hooks/audit'
import { revalidateAfterChange } from '@/hooks/revalidate'

const humanize = (filename?: string) =>
  (filename ?? '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim()

const audit = auditHooks('media', 'alt')

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Фото / файл', plural: 'Медиатека' },
  admin: {
    group: 'Материалы',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'caption', 'updatedAt'],
    description: 'Все фотографии сайта. Обязательно опишите, что на фото — это нужно незрячим и поисковикам.',
  },
  access: {
    read: anyone,
    create: allow('admin', 'editor'),
    update: allow('admin', 'editor'),
    delete: allow('admin', 'editor'),
  },
  hooks: {
    afterChange: [...(audit.afterChange ?? []), revalidateAfterChange],
    afterDelete: audit.afterDelete,
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data
        // alt обязателен: если не заполнен — подставляем подпись или имя файла
        if (!data.alt?.trim()) {
          data.alt = data.caption?.trim() || humanize(data.filename ?? req.file?.name) || 'Фото'
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const { payload } = req
        const checks = await Promise.all([
          payload.count({ collection: 'posts', where: { cover: { equals: id } }, req, overrideAccess: true }),
          payload.count({ collection: 'albums', where: { or: [{ cover: { equals: id } }, { photos: { contains: id } }] }, req, overrideAccess: true }),
          payload.count({ collection: 'churches', where: { heroImages: { contains: id } }, req, overrideAccess: true }),
          payload.count({ collection: 'clergy', where: { photo: { equals: id } }, req, overrideAccess: true }),
        ])
        const used = checks.reduce((sum, c) => sum + c.totalDocs, 0)
        if (used > 0) {
          throw new APIError(
            'Это фото используется в материалах сайта (новость, альбом, страница храма или духовенство). Сначала уберите его оттуда.',
            400,
            undefined,
            true,
          )
        }
      },
    ],
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'application/pdf'],
    focalPoint: true,
    crop: true,
    // автосжатие: не храним исходники больше 2560 px
    resizeOptions: { width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true },
    formatOptions: { format: 'jpeg', options: { quality: 82, mozjpeg: true } },
    imageSizes: [
      { name: 'thumb', width: 480, height: 480, fit: 'cover', formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'card', width: 960, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'hero', width: 1920, formatOptions: { format: 'webp', options: { quality: 80 } } },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    {
      name: 'alt',
      label: 'Описание фото (alt)',
      type: 'text',
      admin: {
        description: 'Обязательно. Опишите, что на фото: «Храм св. Нины, вид с юга». Если оставить пустым — подставится подпись.',
      },
    },
    { name: 'caption', label: 'Подпись под фото', type: 'text' },
    {
      type: 'row',
      fields: [
        { name: 'author', label: 'Автор фото', type: 'text' },
        { name: 'year', label: 'Год (для исторических)', type: 'text' },
      ],
    },
    { name: 'source', label: 'Источник (архив, музей, книга)', type: 'text' },
  ],
}
