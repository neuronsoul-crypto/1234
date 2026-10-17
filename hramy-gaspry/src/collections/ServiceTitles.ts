import type { CollectionConfig } from 'payload'

import { allow, anyone } from '@/access/roles'
import { SERVICE_TYPES } from '@/lib/service-types'

export const ServiceTitles: CollectionConfig = {
  slug: 'service-titles',
  labels: { singular: 'Название службы', plural: 'Справочник служб' },
  admin: {
    useAsTitle: 'title',
    group: 'Расписание',
    defaultColumns: ['title', 'type'],
    description: 'Готовые названия, чтобы не вписывать «Божественная литургия» каждый раз.',
  },
  defaultSort: 'order',
  access: {
    read: anyone,
    create: allow('admin', 'editor', 'clergy'),
    update: allow('admin', 'editor', 'clergy'),
    delete: allow('admin'),
  },
  fields: [
    { name: 'title', label: 'Название', type: 'text', required: true, unique: true },
    {
      name: 'type',
      label: 'Вид службы',
      type: 'select',
      required: true,
      options: SERVICE_TYPES.map((t) => ({ ...t })),
    },
    { name: 'order', label: 'Порядок', type: 'number', defaultValue: 0 },
  ],
}
