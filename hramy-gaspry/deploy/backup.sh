#!/usr/bin/env bash
# Ежедневный бэкап базы и папки /media. Хранится 14 последних копий.
# cron: 30 3 * * * /var/www/hramy-gaspry/deploy/backup.sh >> /var/log/hramy-backup.log 2>&1
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/hramy-gaspry}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/hramy-gaspry}"
KEEP="${KEEP:-14}"
STAMP="$(date +%Y-%m-%d_%H%M)"

# DATABASE_URL берём из .env приложения
set -a; source "$APP_DIR/.env"; set +a

mkdir -p "$BACKUP_DIR"
pg_dump --format=custom --no-owner "$DATABASE_URL" > "$BACKUP_DIR/db_$STAMP.dump"
if [ -d "$APP_DIR/media" ]; then
  tar -C "$APP_DIR" -czf "$BACKUP_DIR/media_$STAMP.tar.gz" media
fi

# удаляем старые копии
ls -1t "$BACKUP_DIR"/db_*.dump 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm --
ls -1t "$BACKUP_DIR"/media_*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm --

echo "$(date -Is) backup ok: $STAMP"
# Восстановление: pg_restore --clean --no-owner -d "$DATABASE_URL" db_ДАТА.dump && tar -C "$APP_DIR" -xzf media_ДАТА.tar.gz
