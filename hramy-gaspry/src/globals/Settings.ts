import type { GlobalConfig } from 'payload'

import { allow, anyone, hiddenUnless } from '@/access/roles'
import { auditGlobal } from '@/hooks/audit'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Настройки сайта',
  admin: {
    group: 'Управление',
    hidden: hiddenUnless('admin'),
    description: 'Телефоны, реквизиты, QR-код, сбор пожертвований и объявление на главной — всё на одном экране.',
  },
  access: { read: anyone, update: allow('admin') },
  versions: { max: 30 },
  hooks: { afterChange: [revalidateGlobal, auditGlobal('settings')] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Приход и контакты',
          fields: [
            { name: 'parishName', label: 'Официальное название прихода', type: 'text', required: true },
            { name: 'siteName', label: 'Название на сайте', type: 'text', required: true, defaultValue: 'Храмы Гаспры' },
            {
              name: 'phones',
              label: 'Телефоны',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'number', label: 'Номер', type: 'text', required: true },
                    { name: 'label', label: 'Кому звонить', type: 'text', admin: { placeholder: 'Настоятель' } },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'email', label: 'E-mail прихода', type: 'email' },
                { name: 'telegram', label: 'Telegram-канал (ссылка)', type: 'text' },
                { name: 'vk', label: 'ВКонтакте (ссылка)', type: 'text' },
              ],
            },
            { name: 'shopHours', label: 'Время работы храма и лавки', type: 'textarea' },
          ],
        },
        {
          label: 'Реквизиты и QR',
          fields: [
            {
              name: 'requisites',
              label: 'Банковские реквизиты',
              type: 'group',
              fields: [
                { name: 'recipient', label: 'Получатель', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'inn', label: 'ИНН', type: 'text' },
                    { name: 'kpp', label: 'КПП', type: 'text' },
                    { name: 'ogrn', label: 'ОГРН', type: 'text' },
                  ],
                },
                { name: 'account', label: 'Расчётный счёт', type: 'text' },
                { name: 'bank', label: 'Банк', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'bik', label: 'БИК', type: 'text' },
                    { name: 'corrAccount', label: 'Корр. счёт', type: 'text' },
                  ],
                },
                {
                  name: 'purpose',
                  label: 'Назначение платежа',
                  type: 'text',
                  defaultValue: 'Добровольное пожертвование на уставную деятельность',
                },
              ],
            },
            { name: 'sbpQr', label: 'QR-код СБП', type: 'upload', relationTo: 'media' },
            { name: 'sbpLink', label: 'Ссылка СБП (для кнопки на телефоне)', type: 'text' },
            { name: 'legalAddress', label: 'Юридический адрес', type: 'text' },
          ],
        },
        {
          label: 'Сбор пожертвований',
          fields: [
            {
              name: 'campaign',
              label: 'Текущий сбор',
              type: 'group',
              fields: [
                { name: 'enabled', label: 'Показывать сбор на сайте', type: 'checkbox', defaultValue: false },
                { name: 'title', label: 'На что собираем', type: 'text' },
                { name: 'description', label: 'Описание', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'goal', label: 'Нужно собрать, ₽', type: 'number', min: 0 },
                    { name: 'collected', label: 'Уже собрано, ₽', type: 'number', min: 0 },
                  ],
                },
              ],
            },
            {
              name: 'needs',
              label: 'Нужды прихода',
              type: 'array',
              fields: [
                { name: 'title', label: 'Что нужно', type: 'text', required: true },
                { name: 'text', label: 'Пояснение', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Объявление',
          fields: [
            {
              name: 'banner',
              label: 'Объявление на сайте',
              type: 'group',
              admin: { description: 'Полоса вверху всех страниц. Например: «Внимание! 19 октября литургия в 8:00».' },
              fields: [
                { name: 'enabled', label: 'Показывать объявление', type: 'checkbox', defaultValue: false },
                { name: 'text', label: 'Текст', type: 'text' },
                { name: 'link', label: 'Ссылка (необязательно)', type: 'text' },
                {
                  name: 'until',
                  label: 'Показывать до',
                  type: 'date',
                  admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'После этой даты объявление скроется само.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Календарь «Сегодня»',
          fields: [
            {
              name: 'calendar',
              label: 'Церковный календарь',
              type: 'group',
              admin: {
                description:
                  'Дата по старому стилю, седмица, посты и великие праздники рассчитываются сами. Память святых можно вписать вручную.',
              },
              fields: [
                {
                  name: 'saintsDate',
                  label: 'На какую дату',
                  type: 'date',
                  admin: { date: { pickerAppearance: 'dayOnly' } },
                },
                { name: 'saints', label: 'Память святых', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Уведомления',
          fields: [
            {
              name: 'notify',
              label: 'Кому сообщать о заявках',
              type: 'group',
              fields: [
                { name: 'emails', label: 'E-mail (через запятую)', type: 'text' },
                {
                  name: 'telegramChatId',
                  label: 'ID служебного чата Telegram',
                  type: 'text',
                  admin: { description: 'Куда бот пришлёт записки и напоминание о расписании.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Поисковики',
          fields: [
            { name: 'metaDescription', label: 'Описание сайта для поисковиков', type: 'textarea' },
            { name: 'ogImage', label: 'Картинка для соцсетей', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
