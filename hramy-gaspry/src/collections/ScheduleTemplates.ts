import type { CollectionConfig } from 'payload'

import { allow } from '@/access/roles'
import { isValidTime, normalizeTime } from '@/lib/dates'
import { SERVICE_TYPES, guessServiceType } from '@/lib/service-types'

export const WEEKDAY_OPTIONS = [
  { label: 'Понедельник', value: '1' },
  { label: 'Вторник', value: '2' },
  { label: 'Среда', value: '3' },
  { label: 'Четверг', value: '4' },
  { label: 'Пятница', value: '5' },
  { label: 'Суббота', value: '6' },
  { label: 'Воскресенье', value: '7' },
]

export const ScheduleTemplates: CollectionConfig = {
  slug: 'schedule-templates',
  labels: { singular: 'Служба обычной недели', plural: 'Шаблон недели' },
  admin: {
    useAsTitle: 'label',
    group: 'Расписание',
    defaultColumns: ['weekday', 'time', 'title', 'church', 'active'],
    description:
      'Постоянное расписание «обычной недели». Кнопка «Заполнить из шаблона» на главном экране создаёт по нему службы.',
  },
  defaultSort: ['weekday', 'time'],
  access: {
    read: allow('admin', 'editor', 'clergy'),
    create: allow('admin', 'editor', 'clergy'),
    update: allow('admin', 'editor', 'clergy'),
    delete: allow('admin', 'editor', 'clergy'),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        const merged = { ...originalDoc, ...data }
        if (data.time && isValidTime(data.time)) data.time = normalizeTime(data.time)
        const presetId = typeof merged.preset === 'object' ? merged.preset?.id : merged.preset
        if (presetId && !merged.title) {
          const preset = await req.payload
            .findByID({ collection: 'service-titles', id: presetId, req, depth: 0 })
            .catch(() => null)
          if (preset) {
            data.title = preset.title
            data.type = preset.type
          }
        }
        const title = data.title ?? merged.title
        if (title && (!merged.type || merged.type === 'other')) data.type = guessServiceType(title)
        const wd = WEEKDAY_OPTIONS.find((o) => o.value === String(merged.weekday))?.label ?? ''
        data.label = `${wd} · ${merged.time ?? ''} · ${title ?? ''}`
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'weekday', label: 'День недели', type: 'select', required: true, options: WEEKDAY_OPTIONS },
        {
          name: 'time',
          label: 'Время',
          type: 'text',
          required: true,
          validate: (v: string | null | undefined) => (v && isValidTime(v)) || 'Например: 9:00',
        },
      ],
    },
    { name: 'church', label: 'Храм', type: 'relationship', relationTo: 'churches', required: true },
    { name: 'preset', label: 'Из справочника', type: 'relationship', relationTo: 'service-titles' },
    { name: 'title', label: 'Название службы', type: 'text' },
    {
      name: 'type',
      label: 'Вид службы',
      type: 'select',
      defaultValue: 'other',
      options: SERVICE_TYPES.map((t) => ({ ...t })),
    },
    { name: 'note', label: 'Примечание', type: 'text' },
    { name: 'active', label: 'Действует', type: 'checkbox', defaultValue: true },
    { name: 'label', type: 'text', admin: { hidden: true } },
  ],
}
