# Храмы Гаспры

Сайт прихода: храм святой равноапостольной Нины и церковь иконы Божией Матери «Нерушимая Стена» (пгт Гаспра, Ялта).
Техническое задание — [`TZ-sayt-hramy-gaspry.md`](TZ-sayt-hramy-gaspry.md), план и статус — [`PLAN.md`](PLAN.md), что нужно от заказчика — [`TODO.md`](TODO.md).

**Стек:** Next.js 16.4 (App Router) · Payload CMS 3.91 (админка в том же приложении) · PostgreSQL · Tailwind CSS 4 · sharp.

## Быстрый старт

```bash
cp .env.example .env            # заполнить DATABASE_URL и PAYLOAD_SECRET
npm install
npm run dev                     # http://localhost:3000, админка — /admin
SEED_ADMIN_PASSWORD=... npm run seed   # демо-данные (повторно: npm run seed -- --reset)
```

После сида: `admin@example.ru`, `editor@example.ru`, `clergy@example.ru` с паролем из `SEED_ADMIN_PASSWORD`.

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` / `build` / `start` | разработка / сборка / запуск |
| `npm run lint`, `npm run typecheck`, `npm test` | ESLint, TypeScript, тесты (парсер расписания, церковный календарь) |
| `npm run generate:types` | типы из конфигурации Payload → `src/payload-types.ts` |
| `npm run migrate:create имя` / `npm run migrate` | миграции БД (в продакшене применяются автоматически при старте) |
| `node scripts/screenshots.mjs` | скриншоты страниц на 375/1440 px |
| `node scripts/docs-screenshots.mjs`, `node scripts/docs-pdf.mjs` | картинки и PDF для инструкции редактора |

## Устройство

```
src/
  app/(frontend)/     страницы сайта (/, /raspisanie, /hramy/[slug], /novosti, /arhiv, …), /styleguide, /og, .ics
  app/(payload)/      админка Payload и REST API (/admin, /api)
  collections/        коллекции CMS (службы, шаблон недели, справочник, новости, альбомы, храмы, …)
  globals/Settings.ts «Настройки сайта»
  endpoints/          генерация недели из шаблона, импорт текстом, cron-задачи
  components/ui/      дизайн-система (витрина — /styleguide)
  components/admin/   главный экран админки, календарь недели, импорт расписания, брендинг
  lib/                даты (Крым, UTC+3), церковный календарь, парсер расписания, ics, Telegram
  seed/               демо-данные и генератор фото-заглушек
deploy/               nginx, бэкапы, crontab;  ecosystem.config.cjs — PM2
docs/                 инструкция редактора (md + pdf), шпаргалка A4
```

**Роли:** `admin` — всё; `editor` — новости, альбомы, медиа, расписание; `clergy` — расписание и заявки.

## Деплой (VPS в РФ)

1. Node.js 22 LTS, PostgreSQL 16, nginx, certbot, PM2.
2. `git clone …`, `cp .env.example .env` и заполнить (в т.ч. `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, SMTP, Telegram, Яндекс).
3. `npm ci && npm run build && pm2 start ecosystem.config.cjs && pm2 save && pm2 startup`.
   Миграции применятся при первом запуске. Первый пользователь создаётся на `/admin` (или `npm run seed` для демо).
4. `deploy/nginx.conf` → `/etc/nginx/sites-available/`, `certbot --nginx -d домен`.
5. `crontab deploy/crontab` — бэкап БД и `/media` ежедневно (14 копий), напоминание о расписании по понедельникам в 10:00, очистка корзины.

> База, созданная в режиме разработки (`npm run dev`), помечена как «dev» — перед `NODE_ENV=production` на ней Payload спросит подтверждение миграций. На сервере используйте чистую базу.

Медиа хранятся в `/media`; чтобы перейти на Yandex Object Storage, задайте переменные `S3_*` в `.env`.
