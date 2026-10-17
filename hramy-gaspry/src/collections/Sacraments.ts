import type { CollectionConfig } from 'payload'

import { allow, anyone, hiddenUnless } from '@/access/roles'
import { editorSimple } from '@/blocks/richtext'
import { slugField } from '@/fields/slug'
import { auditHooks } from '@/hooks/audit'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

const audit = auditHooks('sacraments', 'title')

export const Sacraments: CollectionConfig = {
  slug: 'sacraments',
  labels: { singular: 'Таинство / треба', plural: 'Таинства и требы' },
  admin: {
    useAsTitle: 'title',
    group: 'Страницы сайта',
    defaultColumns: ['title', 'order'],
    hidden: hiddenUnless('admin'),
  },
  defaultSort: 'order',
  access: { read: anyone, create: allow('admin'), update: allow('admin'), delete: allow('admin') },
  versions: { maxPerDoc: 20 },
  hooks: {
    afterChange: [...(audit.afterChange ?? []), revalidateAfterChange],
    afterDelete: [...(audit.afterDelete ?? []), revalidateAfterDelete],
  },
  fields: [
    { name: 'title', label: 'Название', type: 'text', required: true },
    { name: 'intro', label: 'Что это (коротко)', type: 'textarea', required: true },
    { name: 'preparation', label: 'Как подготовиться', type: 'richText', editor: editorSimple },
    { name: 'documents', label: 'Какие документы нужны', type: 'richText', editor: editorSimple },
    { name: 'schedule', label: 'Когда совершается', type: 'textarea' },
    { name: 'contact', label: 'К кому обращаться', type: 'textarea' },
    {
      name: 'cta',
      label: 'Текст кнопки записи',
      type: 'text',
      defaultValue: 'Записаться',
      admin: { description: 'Оставьте пустым, если запись через сайт не нужна.' },
    },
    { name: 'order', label: 'Порядок', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    slugField('title'),
  ],
}
