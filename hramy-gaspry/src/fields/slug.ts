import type { Field } from 'payload'

import { slugify } from '@/lib/translit'

/** Поле-адрес страницы: заполняется транслитом из названия, можно поправить вручную. */
export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  label: 'Адрес (slug)',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Часть адреса страницы латиницей. Заполняется автоматически из названия.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const source = data?.[from]
        return typeof source === 'string' ? slugify(source) : value
      },
    ],
  },
})
