import type { CollectionConfig } from 'payload'

import { allow, anyone, hiddenUnless } from '@/access/roles'
import { auditHooks } from '@/hooks/audit'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

const audit = auditHooks('clergy', 'name')

export const Clergy: CollectionConfig = {
  slug: 'clergy',
  labels: { singular: 'Священнослужитель', plural: 'Духовенство' },
  admin: {
    useAsTitle: 'name',
    group: 'Страницы сайта',
    defaultColumns: ['name', 'rank', 'position', 'order'],
    hidden: hiddenUnless('admin'),
  },
  defaultSort: 'order',
  access: { read: anyone, create: allow('admin'), update: allow('admin'), delete: allow('admin') },
  hooks: {
    afterChange: [...(audit.afterChange ?? []), revalidateAfterChange],
    afterDelete: [...(audit.afterDelete ?? []), revalidateAfterDelete],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'rank', label: 'Сан', type: 'text', required: true, admin: { placeholder: 'Протоиерей' } },
        { name: 'name', label: 'Имя', type: 'text', required: true, admin: { placeholder: 'Иоанн Иванов' } },
      ],
    },
    { name: 'position', label: 'Должность', type: 'text', admin: { placeholder: 'Настоятель' } },
    { name: 'photo', label: 'Фото', type: 'upload', relationTo: 'media' },
    { name: 'ordinationDate', label: 'Дата хиротонии', type: 'text', admin: { placeholder: '14 октября 2005 г.' } },
    { name: 'nameDay', label: 'День тезоименитства', type: 'text' },
    { name: 'bio', label: 'Краткая биография', type: 'textarea' },
    {
      name: 'order',
      label: 'Порядок',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Настоятель — 1, он выводится первым.' },
    },
  ],
}
