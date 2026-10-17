# Сайт храмов Гаспры — заметки для Claude Code

ТЗ — `TZ-sayt-hramy-gaspry.md`, статус — `PLAN.md`, данные от заказчика — `TODO.md`.

- Next.js 16 + Payload 3 в одном приложении; перед изменением API читай `node_modules/next/dist/docs/` (см. AGENTS.md).
- Никаких выдуманных фактов о храмах, датах, духовенстве — только заглушки `[TODO]` и запись в `TODO.md`.
- Тексты интерфейса и коммиты — на русском. Церковная лексика: «Божественная литургия», «Всенощное бдение», «о здравии», «о упокоении».
- Даты служб хранятся как полдень UTC выбранного дня (`keyToStored`), время — строкой `HH:MM`; часовой пояс сайта — Europe/Simferopol.
- После изменений: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; вёрстку проверять на 375 и 1440 px (`node scripts/screenshots.mjs`).
- Изменили коллекции → `npm run generate:types`, `npm run generate:importmap`, `npm run migrate:create имя`.
