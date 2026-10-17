import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { allow } from '@/access/roles'
import {
  generateWeekEndpoint,
  importServicesEndpoint,
  parseTextEndpoint,
  publishWeekEndpoint,
} from '@/endpoints/schedule'
import { auditHooks } from '@/hooks/audit'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { formatShortDate, isValidTime, keyToStored, normalizeTime, storedToKey } from '@/lib/dates'
import { FEAST_RANKS, SERVICE_STATUSES, SERVICE_TYPES, guessServiceType } from '@/lib/service-types'

const audit = auditHooks('services', 'label')

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Служба', plural: 'Богослужения' },
  admin: {
    useAsTitle: 'label',
    group: 'Расписание',
    defaultColumns: ['date', 'time', 'title', 'church', 'status', 'published'],
    listSearchableFields: ['title', 'feast', 'note'],
    description:
      'Каждая строка — одна служба. Быстрее всего заполнять неделю с главного экрана: «Заполнить из шаблона» или «Вставить текстом».',
    pagination: { defaultLimit: 50 },
  },
  defaultSort: ['-date', 'time'],
  access: {
    read: ({ req }) => (req.user ? true : { published: { equals: true } }),
    create: allow('admin', 'editor', 'clergy'),
    update: allow('admin', 'editor', 'clergy'),
    delete: allow('admin', 'editor', 'clergy'),
  },
  endpoints: [generateWeekEndpoint, parseTextEndpoint, importServicesEndpoint, publishWeekEndpoint],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        const merged = { ...originalDoc, ...data }
        if (data.date) {
          const key = storedToKey(data.date)
          data.date = keyToStored(key)
        }
        if (data.time) {
          if (!isValidTime(data.time)) throw new APIError('Время укажите в виде 9:00 или 17:30', 400, undefined, true)
          data.time = normalizeTime(data.time)
        }
        // Название и вид — из справочника, если не заполнены
        const presetId = typeof merged.preset === 'object' ? merged.preset?.id : merged.preset
        if (presetId && (!merged.title || data.preset !== originalDoc?.preset)) {
          const preset = await req.payload
            .findByID({ collection: 'service-titles', id: presetId, req, depth: 0 })
            .catch(() => null)
          if (preset) {
            if (!data.title || data.preset !== originalDoc?.preset) data.title = preset.title
            if (!merged.type || merged.type === 'other') data.type = preset.type
          }
        }
        const title = data.title ?? merged.title
        if (title && (!merged.type || merged.type === 'other')) data.type = guessServiceType(title)
        const dateKey = storedToKey(data.date ?? merged.date)
        data.label = `${dateKey ? formatShortDate(dateKey) : ''} · ${data.time ?? merged.time ?? ''} · ${title ?? ''}`
        return data
      },
    ],
    afterChange: [...(audit.afterChange ?? []), revalidateAfterChange],
    afterDelete: [...(audit.afterDelete ?? []), revalidateAfterDelete],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          label: 'Дата',
          type: 'date',
          required: true,
          index: true,
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy, EEEE' }, width: '50%' },
        },
        {
          name: 'time',
          label: 'Время',
          type: 'text',
          required: true,
          admin: { placeholder: '9:00', width: '50%' },
          validate: (v: string | null | undefined) => (v && isValidTime(v)) || 'Например: 9:00 или 17:30',
        },
      ],
    },
    {
      name: 'church',
      label: 'Храм',
      type: 'relationship',
      relationTo: 'churches',
      required: true,
      index: true,
    },
    {
      name: 'preset',
      label: 'Выбрать из справочника',
      type: 'relationship',
      relationTo: 'service-titles',
      admin: { description: 'Название подставится само. Или впишите своё ниже.' },
    },
    {
      name: 'title',
      label: 'Название службы',
      type: 'text',
      admin: { description: 'Если выбрано из справочника — можно не заполнять.' },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: Record<string, unknown> }) =>
        Boolean(value || siblingData?.preset) || 'Выберите службу из справочника или впишите название',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Вид службы',
          type: 'select',
          defaultValue: 'other',
          options: SERVICE_TYPES.map((t) => ({ ...t })),
          admin: { width: '50%' },
        },
        {
          name: 'status',
          label: 'Состояние',
          type: 'select',
          defaultValue: 'scheduled',
          options: SERVICE_STATUSES.map((t) => ({ ...t })),
          admin: { width: '50%', description: 'Отменённая служба останется на сайте с пометкой «Отменено».' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'feast', label: 'Праздник / память дня', type: 'text', admin: { width: '60%' } },
        {
          name: 'feastRank',
          label: 'Уровень праздника',
          type: 'select',
          defaultValue: 'none',
          options: FEAST_RANKS.map((t) => ({ ...t })),
          admin: { width: '40%' },
        },
      ],
    },
    { name: 'celebrant', label: 'Служащий священник', type: 'relationship', relationTo: 'clergy' },
    {
      name: 'note',
      label: 'Примечание',
      type: 'text',
      admin: { placeholder: 'Исповедь с 8:30', description: 'Для переноса: «Перенесено с 9:00».' },
    },
    {
      name: 'published',
      label: 'Показывать на сайте',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: { position: 'sidebar', description: 'Службы из шаблона создаются скрытыми — проверьте и опубликуйте.' },
    },
    { name: 'label', type: 'text', admin: { hidden: true } },
  ],
}

