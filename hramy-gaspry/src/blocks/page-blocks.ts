import type { Block } from 'payload'

import { editorWithMedia } from './richtext'

export const TextSection: Block = {
  slug: 'text',
  labels: { singular: 'Текст', plural: 'Тексты' },
  fields: [
    { name: 'heading', label: 'Заголовок раздела', type: 'text' },
    { name: 'pathLabel', label: 'Метка-путь (например, /как-добраться)', type: 'text' },
    { name: 'body', label: 'Текст', type: 'richText', editor: editorWithMedia },
  ],
}

export const CardsSection: Block = {
  slug: 'cards',
  labels: { singular: 'Карточки', plural: 'Карточки' },
  fields: [
    { name: 'heading', label: 'Заголовок раздела', type: 'text' },
    {
      name: 'items',
      label: 'Карточки',
      type: 'array',
      labels: { singular: 'Карточка', plural: 'Карточки' },
      fields: [
        { name: 'title', label: 'Заголовок', type: 'text', required: true },
        { name: 'text', label: 'Текст', type: 'textarea' },
        { name: 'link', label: 'Ссылка (необязательно)', type: 'text' },
      ],
    },
  ],
}

export const StepsSection: Block = {
  slug: 'steps',
  labels: { singular: 'Шаги / маршрут', plural: 'Шаги' },
  fields: [
    { name: 'heading', label: 'Заголовок раздела', type: 'text' },
    {
      name: 'items',
      label: 'Шаги',
      type: 'array',
      fields: [
        { name: 'title', label: 'Заголовок', type: 'text', required: true },
        { name: 'text', label: 'Текст', type: 'textarea' },
      ],
    },
  ],
}

export const FaqSection: Block = {
  slug: 'faq',
  labels: { singular: 'Вопросы и ответы', plural: 'Вопросы и ответы' },
  fields: [
    { name: 'heading', label: 'Заголовок раздела', type: 'text' },
    {
      name: 'items',
      label: 'Вопросы',
      type: 'array',
      fields: [
        { name: 'question', label: 'Вопрос', type: 'text', required: true },
        { name: 'answer', label: 'Ответ', type: 'textarea', required: true },
      ],
    },
  ],
}

export const CalloutSection: Block = {
  slug: 'callout',
  labels: { singular: 'Выделенный текст', plural: 'Выделенные тексты' },
  fields: [
    { name: 'text', label: 'Текст', type: 'textarea', required: true },
    {
      name: 'tone',
      label: 'Оформление',
      type: 'select',
      defaultValue: 'gold',
      options: [
        { label: 'Золото (важное)', value: 'gold' },
        { label: 'Лазурь (информация)', value: 'lazur' },
      ],
    },
  ],
}

export const ImageSection: Block = {
  slug: 'image',
  labels: { singular: 'Фото', plural: 'Фото' },
  fields: [
    { name: 'image', label: 'Фото', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', label: 'Подпись', type: 'text' },
  ],
}

export const ContactsSection: Block = {
  slug: 'contacts',
  labels: { singular: 'Контакты прихода', plural: 'Контакты прихода' },
  admin: { disableBlockName: true },
  fields: [
    {
      name: 'note',
      label: 'Пояснение',
      type: 'text',
      admin: { description: 'Телефоны и адреса подставляются из «Настроек сайта».' },
    },
  ],
}

export const MapSection: Block = {
  slug: 'map',
  labels: { singular: 'Карта храмов', plural: 'Карты' },
  fields: [{ name: 'heading', label: 'Заголовок', type: 'text', defaultValue: 'Как нас найти' }],
}

export const PAGE_BLOCKS = [
  TextSection,
  CardsSection,
  StepsSection,
  FaqSection,
  CalloutSection,
  ImageSection,
  ContactsSection,
  MapSection,
]
