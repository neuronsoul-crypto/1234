# Деплой на tavrida-osmotr.ru/aifaces

Цель: поднять `platform/` на сервере `89.125.121.44` так, чтобы оно открывалось по адресу
`https://tavrida-osmotr.ru/aifaces`, не трогая остальной существующий сайт на этом домене.

Этот файл написан для того, кто выполняет команды на сервере (человек по SSH или Claude Code с
доступом к сети) — выполнять шаги по порядку, не пропуская шаг 1.

**Прежде чем начинать:** пароль root от этого сервера был отправлен в чат в открытом виде.
После деплоя его нужно сменить (`passwd`) — независимо от того, кто и как деплоил.

---

## Шаг 1 — Разведка перед изменениями (обязательно, ничего не трогаем)

Сервер уже обслуживает как минимум один рабочий сайт (tavrida-osmotr.ru). Сначала смотрим, что там есть,
и только потом что-то меняем.

```bash
cat /etc/os-release
node -v 2>&1; npm -v 2>&1
psql --version 2>&1
which nginx; nginx -v 2>&1
ls -la /usr/local/fastpanel2 2>&1 | head -3   # если существует — сервер под FASTPANEL
ss -tlnp | grep -E ':(80|443|3000|3050|5432)\b'
```

Дальше — по результатам:

- **Если стоит FASTPANEL** — не редактируем `/etc/nginx/*` руками, конфиги панель может перезаписать.
  Location-блок для `/aifaces` добавляется через UI FASTPANEL у сайта tavrida-osmotr.ru в поле
  «Дополнительные директивы Nginx» (или аналогичное — название зависит от версии панели) —
  туда вставляется содержимое `platform/deploy/nginx-aifaces-location.conf`.
- **Если чистый nginx** — найти файл текущего vhost:
  `grep -rl "tavrida-osmotr.ru" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null`
  и добавить туда `include` на сниппет (шаг 6), а не переписывать файл целиком.
- Порт **3050** должен быть свободен (см. `ss` выше) — если занят, поменять порт во всех трёх местах:
  `platform/deploy/aifaces.service`, `platform/deploy/nginx-aifaces-location.conf`,
  команда `npm run start -- -p <порт>`.

---

## Шаг 2 — Код на сервер

Вариант А (проще, если на сервере есть доступ к GitHub и репозиторий публичный/есть токен):

```bash
mkdir -p /var/www/aifaces
git clone --branch claude/new-session-ww1s7o https://github.com/neuronsoul-crypto/1234.git /tmp/aifaces-src
rsync -a --delete /tmp/aifaces-src/platform/ /var/www/aifaces/
```

Вариант Б (если репозиторий приватный без токена на сервере) — синхронизировать с локальной машины,
где уже есть доступ к репозиторию:

```bash
# выполняется НЕ на сервере, а там, где лежит клон репозитория
rsync -av --exclude node_modules --exclude .next --exclude .env \
  ./platform/ root@89.125.121.44:/var/www/aifaces/
```

---

## Шаг 3 — Node.js и PostgreSQL

```bash
# Node.js 20 LTS, если отсутствует или версия < 18
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# PostgreSQL, если ещё не стоит (пропустить, если уже используется другими сайтами на сервере)
apt-get install -y postgresql postgresql-contrib
service postgresql start
```

Создать отдельную БД и пользователя (пароль — сгенерировать новый, не путать с root/SSH-паролем сервера):

```bash
DB_PASSWORD=$(openssl rand -hex 16)
su postgres -c "psql -c \"CREATE USER aifaces WITH PASSWORD '${DB_PASSWORD}';\""
su postgres -c "psql -c \"CREATE DATABASE aifaces OWNER aifaces;\""
echo "DB_PASSWORD=${DB_PASSWORD}"   # сохранить — понадобится в .env на шаге 4
```

---

## Шаг 4 — Окружение

```bash
cd /var/www/aifaces
cp .env.production.example .env
# в .env прописать:
#   DATABASE_URL с паролем из шага 3
#   SESSION_SECRET — сгенерировать: openssl rand -hex 32
#   DEPLOY_BASE_PATH=/aifaces (уже в примере)
```

---

## Шаг 5 — Установка, миграции, сборка

```bash
cd /var/www/aifaces
npm ci
npx prisma migrate deploy
npm run seed          # опционально — тестовые данные, пароль всех аккаунтов password123.
                        # Для реального запуска с живыми пользователями — пропустить этот шаг.
npm run build          # DEPLOY_BASE_PATH подхватится из .env автоматически
```

---

## Шаг 6 — systemd-сервис

```bash
id -u aifaces &>/dev/null || useradd -r -s /usr/sbin/nologin -d /var/www/aifaces aifaces
chown -R aifaces:aifaces /var/www/aifaces

cp platform_repo_path/platform/deploy/aifaces.service /etc/systemd/system/aifaces.service
systemctl daemon-reload
systemctl enable --now aifaces
systemctl status aifaces --no-pager
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3050/aifaces   # ожидаем 200
```

---

## Шаг 7 — nginx: подключить `/aifaces`

Скопировать сниппет на сервер и **только сослаться** на него из существующего vhost — не переписывать
файл целиком:

```bash
cp platform_repo_path/platform/deploy/nginx-aifaces-location.conf /etc/nginx/snippets/aifaces.conf
```

Внутри существующего `server { server_name tavrida-osmotr.ru; ... }` добавить одну строку
(вручную, редактором, не sed'ом — файл может быть непростым):

```nginx
include /etc/nginx/snippets/aifaces.conf;
```

Проверить и применить:

```bash
nginx -t && systemctl reload nginx    # если nginx -t ругается — НЕ релоадить, сначала разобраться
```

Если сервер под FASTPANEL — см. примечание в шаге 1: содержимое `nginx-aifaces-location.conf`
вставляется через UI панели, а не в файл напрямую.

---

## Шаг 8 — Проверка

```bash
curl -sI https://tavrida-osmotr.ru/aifaces | head -1     # ожидаем 200
curl -sI https://tavrida-osmotr.ru | head -1              # старый сайт не должен был измениться
```

Открыть `https://tavrida-osmotr.ru/aifaces` в браузере, проверить каталог и вход
(тестовые аккаунты — см. `platform/README.md`, если выполнялся `npm run seed`).

---

## После деплоя

- Сменить пароль root на сервере (`passwd`) — текущий был отправлен в чате в открытом виде.
- Если это боевой запуск с реальными пользователями — прогнать нерешённые пункты
  `docs/TZ.md` раздел 12 (юрист по 152-ФЗ, реальный KYC/эскроу/e-signature вместо стабов)
  прежде чем собирать настоящие биометрические данные.
