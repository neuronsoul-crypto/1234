import type { CollectionConfig } from 'payload'

import { allow, hiddenUnless } from '@/access/roles'

export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  labels: { singular: 'Запись журнала', plural: 'Журнал действий' },
  admin: {
    useAsTitle: 'docTitle',
    group: 'Управление',
    defaultColumns: ['createdAt', 'user', 'action', 'collectionSlug', 'docTitle'],
    hidden: hiddenUnless('admin'),
    description: 'Кто и когда создал, изменил или удалил запись. Журнал нельзя редактировать.',
  },
  defaultSort: '-createdAt',
  access: { read: allow('admin'), create: () => false, update: () => false, delete: () => false },
  fields: [
    {
      name: 'action',
      label: 'Действие',
      type: 'select',
      options: [
        { label: 'Создано', value: 'create' },
        { label: 'Изменено', value: 'update' },
        { label: 'Опубликовано', value: 'publish' },
        { label: 'В корзину', value: 'trash' },
        { label: 'Удалено', value: 'delete' },
      ],
    },
    { name: 'collectionSlug', label: 'Раздел', type: 'text' },
    { name: 'docId', label: 'ID записи', type: 'text' },
    { name: 'docTitle', label: 'Запись', type: 'text' },
    { name: 'user', label: 'Кто', type: 'relationship', relationTo: 'users' },
  ],
}
