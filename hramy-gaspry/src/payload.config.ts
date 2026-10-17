import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { s3Storage } from '@payloadcms/storage-s3'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { editorWithMedia } from './blocks/richtext'
import { Albums } from './collections/Albums'
import { AuditLog } from './collections/AuditLog'
import { Churches } from './collections/Churches'
import { Clergy } from './collections/Clergy'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Requests } from './collections/Requests'
import { Sacraments } from './collections/Sacraments'
import { ScheduleTemplates } from './collections/ScheduleTemplates'
import { Services } from './collections/Services'
import { ServiceTitles } from './collections/ServiceTitles'
import { Users } from './collections/Users'
import { purgeTrashEndpoint, weeklyReminderEndpoint } from './endpoints/cron'
import { migrations } from './migrations'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const plugins: Plugin[] = []

// Хранилище медиа: локально в /media, либо Yandex Object Storage (S3-совместимое), если заданы переменные
if (process.env.S3_BUCKET) {
  plugins.push(
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET,
      config: {
        endpoint: process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net',
        region: process.env.S3_REGION || 'ru-central1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    avatar: 'default',
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — Храмы Гаспры',
      robots: 'noindex, nofollow',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
    },
    dateFormat: 'd MMMM yyyy, HH:mm',
    components: {
      graphics: {
        Logo: '/components/admin/Graphics#Logo',
        Icon: '/components/admin/Graphics#Icon',
      },
      beforeDashboard: ['/components/admin/Dashboard#Dashboard'],
      actions: ['/components/admin/OpenSite#OpenSite'],
      views: {
        scheduleImport: {
          Component: '/components/admin/ScheduleImportView#ScheduleImportView',
          path: '/raspisanie-tekstom',
          meta: { title: 'Вставить расписание текстом' },
        },
      },
    },
    livePreview: {
      breakpoints: [
        { label: 'Телефон', name: 'mobile', width: 375, height: 760 },
        { label: 'Планшет', name: 'tablet', width: 768, height: 1024 },
        { label: 'Компьютер', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  i18n: {
    supportedLanguages: { ru },
    fallbackLanguage: 'ru',
  },
  collections: [
    Services,
    ScheduleTemplates,
    ServiceTitles,
    Posts,
    Albums,
    Media,
    Requests,
    Churches,
    Clergy,
    Sacraments,
    Pages,
    Users,
    AuditLog,
  ],
  globals: [Settings],
  endpoints: [weeklyReminderEndpoint, purgeTrashEndpoint],
  editor: editorWithMedia,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // В разработке схема подстраивается сама; на сервере — через миграции (npm run migrate)
    push: process.env.NODE_ENV !== 'production',
    // на сервере миграции применяются автоматически при запуске
    prodMigrations: migrations,
  }),
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || 'noreply@example.ru',
        defaultFromName: 'Храмы Гаспры',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 465),
          secure: Number(process.env.SMTP_PORT || 465) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  jobs: {
    // Отложенная публикация новостей и страниц
    autoRun: [{ cron: '* * * * *', queue: 'default', limit: 10 }],
    shouldAutoRun: async () =>
      process.env.NEXT_PHASE !== 'phase-production-build' && process.env.DISABLE_JOBS !== '1',
    tasks: [],
  },
  sharp,
  plugins,
  telemetry: false,
})
