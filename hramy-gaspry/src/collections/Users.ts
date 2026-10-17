import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { allow, allowField, hiddenUnless, isAdmin } from '@/access/roles'
import { auditHooks } from '@/hooks/audit'

const audit = auditHooks('users', 'name')

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Управление',
    hidden: hiddenUnless('admin'),
  },
  auth: {
    tokenExpiration: 7 * 24 * 60 * 60, // сессия 7 дней
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // блокировка на 15 минут
    useSessions: true,
    verify: process.env.SMTP_HOST
      ? {
          generateEmailSubject: () => 'Приглашение в управление сайтом храмов Гаспры',
          generateEmailHTML: ({ token, user }) => {
            const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/users/verify/${token}`
            const name = (user as { name?: string }).name ?? ''
            return `<p>Здравствуйте${name ? `, ${name}` : ''}!</p>
<p>Вас пригласили редактировать сайт храмов Гаспры. Чтобы подтвердить адрес, откройте ссылку:</p>
<p><a href="${url}">${url}</a></p>
<p>Затем войдите с паролем, который вам сообщил администратор, и смените его в разделе «Аккаунт».</p>`
          },
        }
      : false,
    forgotPassword: {
      generateEmailSubject: () => 'Сброс пароля — сайт храмов Гаспры',
      generateEmailHTML: (args) => {
        const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset/${args?.token}`
        return `<p>Чтобы задать новый пароль, откройте ссылку: <a href="${url}">${url}</a></p>
<p>Если вы не запрашивали сброс, просто проигнорируйте это письмо.</p>`
      },
    },
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: ({ req }) => {
      if (isAdmin(req.user)) return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    create: allow('admin'),
    update: ({ req }) => {
      if (isAdmin(req.user)) return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    delete: allow('admin'),
  },
  hooks: {
    ...audit,
    beforeChange: [
      // первый пользователь (экран «Создать первого пользователя») — администратор
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
    beforeValidate: [
      ({ data }) => {
        const password = (data as { password?: string } | undefined)?.password
        if (password && password.length < 10) {
          throw new APIError('Пароль должен быть не короче 10 символов.', 400, undefined, true)
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', label: 'Имя', type: 'text', required: true },
    {
      name: 'role',
      label: 'Роль',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      access: { update: allowField('admin'), create: allowField('admin') },
      options: [
        { label: 'Администратор — всё', value: 'admin' },
        { label: 'Редактор — новости, альбомы, расписание', value: 'editor' },
        { label: 'Священник — расписание и заявки', value: 'clergy' },
      ],
      admin: { description: 'Что человек может делать в админке.' },
    },
  ],
}
