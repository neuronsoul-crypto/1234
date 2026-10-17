import type { CollectionConfig } from 'payload'

import { allow, anyone, hiddenUnless } from '@/access/roles'
import { GalleryBlock, editorSimple, editorWithMedia } from '@/blocks/richtext'
import { slugField } from '@/fields/slug'
import { auditHooks } from '@/hooks/audit'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { CHURCH_COLORS } from '@/lib/site'

const audit = auditHooks('churches', 'name')

export const Churches: CollectionConfig = {
  slug: 'churches',
  labels: { singular: 'Храм', plural: 'Храмы' },
  admin: {
    useAsTitle: 'name',
    group: 'Страницы сайта',
    defaultColumns: ['name', 'shortName', 'address'],
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
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            { name: 'name', label: 'Полное название', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'shortName',
                  label: 'Короткое название',
                  type: 'text',
                  required: true,
                  admin: { description: 'Как подписывать в расписании: «Нины», «Нерушимая Стена».' },
                },
                {
                  name: 'color',
                  label: 'Цвет метки',
                  type: 'select',
                  required: true,
                  options: CHURCH_COLORS.map((c) => ({ ...c })),
                },
              ],
            },
            {
              name: 'aliases',
              label: 'Как храм могут написать в тексте расписания',
              type: 'text',
              admin: {
                description:
                  'Через запятую, части слов: «нин, нине». Нужно для «Вставить расписание текстом».',
              },
            },
            { name: 'heroImages', label: 'Главные фото', type: 'upload', relationTo: 'media', hasMany: true },
            { name: 'intro', label: 'Коротко о храме (2–3 строки)', type: 'textarea' },
            {
              name: 'facts',
              label: 'Краткая справка',
              type: 'array',
              admin: { description: 'Например: «Построен — 1908», «Архитектор — …», «Статус — памятник архитектуры».' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'Что', type: 'text', required: true },
                    { name: 'value', label: 'Значение', type: 'text', required: true },
                  ],
                },
              ],
            },
            { name: 'order', label: 'Порядок вывода', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
          ],
        },
        {
          label: 'История и архитектура',
          fields: [
            {
              name: 'history',
              label: 'История',
              type: 'blocks',
              blocks: [
                {
                  slug: 'timelineItem',
                  labels: { singular: 'Событие хронологии', plural: 'Хронология' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'year', label: 'Год', type: 'text', required: true },
                        { name: 'title', label: 'Событие', type: 'text', required: true },
                      ],
                    },
                    { name: 'text', label: 'Подробнее', type: 'textarea' },
                  ],
                },
                {
                  slug: 'richText',
                  labels: { singular: 'Текст', plural: 'Тексты' },
                  fields: [{ name: 'body', label: 'Текст', type: 'richText', editor: editorWithMedia }],
                },
                GalleryBlock,
              ],
            },
            { name: 'architecture', label: 'Архитектура', type: 'richText', editor: editorWithMedia },
            {
              name: 'extraSection',
              label: 'Дополнительный раздел (например, об иконе)',
              type: 'group',
              fields: [
                { name: 'heading', label: 'Заголовок', type: 'text' },
                { name: 'image', label: 'Фото', type: 'upload', relationTo: 'media' },
                { name: 'body', label: 'Текст', type: 'richText', editor: editorWithMedia },
              ],
            },
          ],
        },
        {
          label: 'Святыни и праздники',
          fields: [
            {
              name: 'shrines',
              label: 'Святыни',
              type: 'array',
              fields: [
                { name: 'title', label: 'Название', type: 'text', required: true },
                { name: 'text', label: 'Описание', type: 'textarea' },
                { name: 'image', label: 'Фото', type: 'upload', relationTo: 'media' },
              ],
            },
            {
              name: 'patronalFeasts',
              label: 'Престольные праздники',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'date', label: 'Дата', type: 'text', required: true, admin: { description: '«27 января»' } },
                    { name: 'title', label: 'Праздник', type: 'text', required: true },
                  ],
                },
                { name: 'note', label: 'Примечание', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Адрес и карта',
          fields: [
            { name: 'address', label: 'Адрес', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'lat', label: 'Широта', type: 'number', admin: { step: 0.000001 } },
                { name: 'lng', label: 'Долгота', type: 'number', admin: { step: 0.000001 } },
              ],
            },
            {
              name: 'yandexOrgId',
              label: 'ID организации в Яндекс.Картах',
              type: 'text',
              admin: { description: 'Число из ссылки yandex.ru/maps/org/…/ЧИСЛО' },
            },
            { name: 'openingHours', label: 'Часы работы храма', type: 'textarea' },
            { name: 'howToGet', label: 'Как пройти', type: 'richText', editor: editorSimple },
          ],
        },
      ],
    },
    slugField('name'),
  ],
}
