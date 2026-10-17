import type { CollectionConfig } from 'payload'

import { allow, hiddenUnless } from '@/access/roles'
import { notifyNewRequest } from '@/hooks/notify-request'

export const REQUEST_TYPES = [
  { label: 'Записка', value: 'zapiska' },
  { label: 'Запись на таинство', value: 'tainstvo' },
  { label: 'Вопрос', value: 'vopros' },
]

export const REQUEST_STATUSES = [
  { label: 'Новая', value: 'new' },
  { label: 'В работе', value: 'progress' },
  { label: 'Выполнена', value: 'done' },
]

export const Requests: CollectionConfig = {
  slug: 'requests',
  labels: { singular: 'Заявка', plural: 'Заявки' },
  admin: {
    useAsTitle: 'summary',
    group: 'Заявки',
    defaultColumns: ['summary', 'type', 'status', 'createdAt'],
    listSearchableFields: ['summary', 'contactName', 'contactPhone'],
    hidden: hiddenUnless('admin', 'clergy'),
    description: 'Записки и записи на таинства с сайта. Содержат персональные данные — не передавайте их третьим лицам.',
    components: {
      beforeListTable: ['/components/admin/RequestsPrintLink#RequestsPrintLink'],
    },
  },
  defaultSort: '-createdAt',
  trash: true,
  access: {
    read: allow('admin', 'clergy'),
    create: allow('admin'),
    update: allow('admin', 'clergy'),
    delete: allow('admin'),
  },
  hooks: { afterChange: [notifyNewRequest] },
  fields: [
    { name: 'summary', label: 'Заявка', type: 'text', admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'type', label: 'Тип', type: 'select', required: true, options: REQUEST_TYPES, admin: { readOnly: true } },
        {
          name: 'status',
          label: 'Статус',
          type: 'select',
          required: true,
          defaultValue: 'new',
          index: true,
          options: REQUEST_STATUSES,
        },
      ],
    },
    {
      name: 'printLink',
      type: 'ui',
      admin: { components: { Field: '/components/admin/RequestPrintButton#RequestPrintButton' } },
    },
    {
      type: 'row',
      fields: [
        { name: 'contactName', label: 'Имя', type: 'text', admin: { readOnly: true } },
        { name: 'contactPhone', label: 'Телефон', type: 'text', admin: { readOnly: true } },
        { name: 'contactEmail', label: 'E-mail', type: 'text', admin: { readOnly: true } },
      ],
    },
    { name: 'church', label: 'Храм', type: 'relationship', relationTo: 'churches', admin: { readOnly: true } },
    {
      name: 'details',
      label: 'Содержание заявки',
      type: 'json',
      admin: { readOnly: true, description: 'Данные из формы на сайте.' },
    },
    { name: 'internalNote', label: 'Служебная заметка', type: 'textarea' },
    { name: 'consentAt', label: 'Согласие на обработку ПДн', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
  ],
}
