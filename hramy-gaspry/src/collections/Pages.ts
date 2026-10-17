import type { CollectionConfig } from 'payload'

import { allow, hiddenUnless, publishedOrLoggedIn } from '@/access/roles'
import { PAGE_BLOCKS } from '@/blocks/page-blocks'
import { slugField } from '@/fields/slug'
import { auditHooks } from '@/hooks/audit'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { absoluteUrl } from '@/lib/site'

const audit = auditHooks('pages', 'title')

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Страница', plural: 'Текстовые страницы' },
  admin: {
    useAsTitle: 'title',
    group: 'Страницы сайта',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: 'Страницы «Паломникам», «Приходская жизнь», «Политика ПДн» и другие. Текст собирается из блоков.',
    hidden: hiddenUnless('admin'),
    livePreview: { url: ({ data }) => absoluteUrl(`/predprosmotr?type=pages&slug=${data?.slug ?? ''}`) },
    preview: (doc) => absoluteUrl(`/predprosmotr?type=pages&slug=${doc?.slug ?? ''}`),
  },
  trash: true,
  access: {
    read: publishedOrLoggedIn,
    create: allow('admin'),
    update: allow('admin'),
    delete: allow('admin'),
  },
  versions: {
    drafts: { autosave: { interval: 2000 }, schedulePublish: true },
    maxPerDoc: 30,
  },
  hooks: {
    afterChange: [...(audit.afterChange ?? []), revalidateAfterChange],
    afterDelete: [...(audit.afterDelete ?? []), revalidateAfterDelete],
  },
  fields: [
    { name: 'title', label: 'Заголовок', type: 'text', required: true },
    { name: 'pathLabel', label: 'Метка-путь над заголовком', type: 'text', admin: { placeholder: '/паломникам' } },
    { name: 'lead', label: 'Вводный абзац', type: 'textarea' },
    { name: 'cover', label: 'Фото в шапке', type: 'upload', relationTo: 'media' },
    { name: 'layout', label: 'Содержимое страницы', type: 'blocks', blocks: PAGE_BLOCKS },
    {
      name: 'metaDescription',
      label: 'Описание для поисковиков',
      type: 'textarea',
      admin: { position: 'sidebar' },
    },
    slugField('title'),
  ],
}
