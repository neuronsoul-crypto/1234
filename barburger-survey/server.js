'use strict';

const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'responses.json');
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'barburger2026';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 часов

if (!process.env.ADMIN_PASSWORD) {
  console.warn('[ВНИМАНИЕ] ADMIN_PASSWORD не задан в переменных окружения — используется пароль по умолчанию "barburger2026". Обязательно задайте свой перед продакшн-деплоем.');
}

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// ---------- Хранилище ответов (JSON-файл, запись сериализована очередью) ----------

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

let writeQueue = Promise.resolve();

async function readResponses() {
  try {
    const raw = await fsp.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function appendResponse(record) {
  writeQueue = writeQueue.then(async () => {
    const list = await readResponses();
    list.push(record);
    await fsp.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  });
  return writeQueue;
}

// ---------- Утилиты ----------

function clampStr(v, max) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

function toEnum(v, allowed) {
  return allowed.includes(v) ? v : '';
}

function toScale(v, min, max) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

function toArrayEnum(v, allowed, max) {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => allowed.includes(x)).slice(0, max);
}

// ---------- Публичный API: приём анкеты ----------

app.post('/api/submit', async (req, res) => {
  const b = req.body || {};

  const record = {
    id: crypto.randomUUID(),
    submitted_at: new Date().toISOString(),
    gender: toEnum(b.gender, ['Мужской', 'Женский']),
    age: toEnum(b.age, ['До 20', '20-30', '30-45', '45 и выше']),
    visit_time: toEnum(b.visit_time, ['12:00-15:00', '15:00-18:00', '18:00-22:00']),
    origin: toEnum(b.origin, ['Из Судака', 'Из Судакского района', 'Приезжий']),
    origin_city: clampStr(b.origin_city, 120),
    company: toEnum(b.company, ['Один/одна', 'С друзьями', 'Со второй половинкой', 'С детьми', 'С коллегами']),
    rate_taste: toScale(b.rate_taste, 1, 5),
    rate_value: toScale(b.rate_value, 1, 5),
    rate_range: toScale(b.rate_range, 1, 5),
    rate_design: toScale(b.rate_design, 1, 5),
    portion_size: toEnum(b.portion_size, ['Порции слишком большие', 'Размер порции оптимальный', 'Порции маленькие']),
    favorites: toArrayEnum(b.favorites, ['Бургеры', 'Стритфуд', 'Мясо и пасты', 'Супы / салаты', 'Закуски', 'Другое'], 6),
    favorites_other: clampStr(b.favorites_other, 200),
    menu_wishes: clampStr(b.menu_wishes, 2000),
    comments: clampStr(b.comments, 2000),
    nps: toScale(b.nps, 1, 10),
  };

  try {
    await appendResponse(record);
    res.json({ ok: true });
  } catch (e) {
    console.error('Ошибка сохранения анкеты:', e);
    res.status(500).json({ ok: false, error: 'Не удалось сохранить анкету' });
  }
});

// ---------- Авторизация админки (подписанная cookie-сессия, без БД) ----------

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verify(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

function requireAdmin(req, res, next) {
  const cookies = parseCookies(req);
  const session = verify(cookies.admin_session);
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ ok: false, error: 'Требуется авторизация' });
  }
  next();
}

// простая защита от подбора пароля: не более 8 попыток в 15 минут с одного IP
const loginAttempts = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const entry = loginAttempts.get(ip) || { count: 0, since: now };
  if (now - entry.since > windowMs) {
    entry.count = 0;
    entry.since = now;
  }
  entry.count += 1;
  loginAttempts.set(ip, entry);
  return entry.count > 8;
}

app.post('/api/admin/login', (req, res) => {
  const ip = req.ip;
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Слишком много попыток. Попробуйте позже.' });
  }
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const a = Buffer.from(password.padEnd(128, '\0'));
  const b = Buffer.from(String(ADMIN_PASSWORD).padEnd(128, '\0'));
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b) && password.length > 0;

  if (!ok) {
    return res.status(401).json({ ok: false, error: 'Неверный пароль' });
  }

  const token = sign({ role: 'admin', exp: Date.now() + SESSION_TTL_MS });
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `admin_session=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; SameSite=Lax${secure ? '; Secure' : ''}`);
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
  res.json({ ok: true });
});

// ---------- Админ API: данные и статистика ----------

function buildSummary(list) {
  const total = list.length;

  const count = (getKey, allowed) => {
    const out = {};
    allowed.forEach((k) => (out[k] = 0));
    list.forEach((r) => {
      const v = getKey(r);
      if (v && Object.prototype.hasOwnProperty.call(out, v)) out[v] += 1;
    });
    return out;
  };

  const avg = (key) => {
    const vals = list.map((r) => r[key]).filter((v) => typeof v === 'number');
    if (!vals.length) return null;
    return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100;
  };

  const scaleDist = (key) => {
    const out = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    list.forEach((r) => {
      if (typeof r[key] === 'number') out[r[key]] += 1;
    });
    return out;
  };

  const npsVals = list.map((r) => r.nps).filter((v) => typeof v === 'number');
  const promoters = npsVals.filter((v) => v >= 9).length;
  const detractors = npsVals.filter((v) => v <= 6).length;
  const npsScore = npsVals.length ? Math.round(((promoters - detractors) / npsVals.length) * 100) : null;
  const npsDist = {};
  for (let i = 1; i <= 10; i++) npsDist[i] = 0;
  npsVals.forEach((v) => (npsDist[v] += 1));

  const favoritesCount = {};
  ['Бургеры', 'Стритфуд', 'Мясо и пасты', 'Супы / салаты', 'Закуски', 'Другое'].forEach((k) => (favoritesCount[k] = 0));
  list.forEach((r) => (r.favorites || []).forEach((f) => {
    if (Object.prototype.hasOwnProperty.call(favoritesCount, f)) favoritesCount[f] += 1;
  }));

  return {
    total,
    gender: count((r) => r.gender, ['Мужской', 'Женский']),
    age: count((r) => r.age, ['До 20', '20-30', '30-45', '45 и выше']),
    visit_time: count((r) => r.visit_time, ['12:00-15:00', '15:00-18:00', '18:00-22:00']),
    origin: count((r) => r.origin, ['Из Судака', 'Из Судакского района', 'Приезжий']),
    company: count((r) => r.company, ['Один/одна', 'С друзьями', 'Со второй половинкой', 'С детьми', 'С коллегами']),
    portion_size: count((r) => r.portion_size, ['Порции слишком большие', 'Размер порции оптимальный', 'Порции маленькие']),
    favorites: favoritesCount,
    ratings: {
      taste: { avg: avg('rate_taste'), dist: scaleDist('rate_taste') },
      value: { avg: avg('rate_value'), dist: scaleDist('rate_value') },
      range: { avg: avg('rate_range'), dist: scaleDist('rate_range') },
      design: { avg: avg('rate_design'), dist: scaleDist('rate_design') },
    },
    nps: { avg: avg('nps'), score: npsScore, dist: npsDist, promoters, detractors, respondents: npsVals.length },
  };
}

app.get('/api/admin/summary', requireAdmin, async (req, res) => {
  const list = await readResponses();
  res.json({ ok: true, summary: buildSummary(list) });
});

app.get('/api/admin/responses', requireAdmin, async (req, res) => {
  const list = await readResponses();
  list.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
  res.json({ ok: true, responses: list });
});

app.get('/api/admin/export.xlsx', requireAdmin, async (req, res) => {
  const list = await readResponses();
  list.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
  const summary = buildSummary(list);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Барбургер — анкета гостя';
  workbook.created = new Date();

  // ---- Лист 1: сырые ответы ----
  const sheet = workbook.addWorksheet('Ответы');
  sheet.columns = [
    { header: '№', key: 'n', width: 5 },
    { header: 'Дата и время', key: 'submitted_at', width: 20 },
    { header: 'Пол', key: 'gender', width: 10 },
    { header: 'Возраст', key: 'age', width: 12 },
    { header: 'Время визита', key: 'visit_time', width: 14 },
    { header: 'Откуда', key: 'origin', width: 20 },
    { header: 'Город (если приезжий)', key: 'origin_city', width: 20 },
    { header: 'С кем', key: 'company', width: 20 },
    { header: 'Вкус блюд (1-5)', key: 'rate_taste', width: 15 },
    { header: 'Цена/качество (1-5)', key: 'rate_value', width: 18 },
    { header: 'Ассортимент (1-5)', key: 'rate_range', width: 16 },
    { header: 'Дизайн меню (1-5)', key: 'rate_design', width: 16 },
    { header: 'Размер порций', key: 'portion_size', width: 22 },
    { header: 'Понравилось', key: 'favorites', width: 28 },
    { header: 'Другое (что понравилось)', key: 'favorites_other', width: 22 },
    { header: 'Пожелания по меню', key: 'menu_wishes', width: 34 },
    { header: 'Комментарии', key: 'comments', width: 34 },
    { header: 'NPS (1-10)', key: 'nps', width: 10 },
  ];
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3C2415' } };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  list.forEach((r, i) => {
    sheet.addRow({
      n: i + 1,
      submitted_at: new Date(r.submitted_at).toLocaleString('ru-RU'),
      gender: r.gender,
      age: r.age,
      visit_time: r.visit_time,
      origin: r.origin,
      origin_city: r.origin_city,
      company: r.company,
      rate_taste: r.rate_taste,
      rate_value: r.rate_value,
      rate_range: r.rate_range,
      rate_design: r.rate_design,
      portion_size: r.portion_size,
      favorites: (r.favorites || []).join(', '),
      favorites_other: r.favorites_other,
      menu_wishes: r.menu_wishes,
      comments: r.comments,
      nps: r.nps,
    });
  });

  // ---- Лист 2: сводка ----
  const sum = workbook.addWorksheet('Сводка');
  sum.getColumn(1).width = 32;
  sum.getColumn(2).width = 18;

  let row = 1;
  const title = (text) => {
    const c = sum.getCell(`A${row}`);
    c.value = text;
    c.font = { bold: true, size: 13 };
    row += 1;
  };
  const kv = (k, v) => {
    sum.getCell(`A${row}`).value = k;
    sum.getCell(`B${row}`).value = v;
    row += 1;
  };
  const blank = () => { row += 1; };
  const dist = (obj) => {
    Object.entries(obj).forEach(([k, v]) => kv(k, v));
    blank();
  };

  title('Сводка по анкете «Барбургер»');
  kv('Всего анкет', summary.total);
  kv('Сформировано', new Date().toLocaleString('ru-RU'));
  blank();

  title('Средние оценки (1-5)');
  kv('Вкус блюд', summary.ratings.taste.avg ?? '—');
  kv('Цена/качество', summary.ratings.value.avg ?? '—');
  kv('Ассортимент', summary.ratings.range.avg ?? '—');
  kv('Дизайн меню', summary.ratings.design.avg ?? '—');
  blank();

  title('NPS (готовность рекомендовать)');
  kv('Средний балл (1-10)', summary.nps.avg ?? '—');
  kv('NPS-индекс, %', summary.nps.score ?? '—');
  kv('Промоутеры (9-10)', summary.nps.promoters);
  kv('Критики (0-6)', summary.nps.detractors);
  blank();

  title('Пол'); dist(summary.gender);
  title('Возраст'); dist(summary.age);
  title('Время визита'); dist(summary.visit_time);
  title('Откуда гости'); dist(summary.origin);
  title('С кем пришли'); dist(summary.company);
  title('Размер порций'); dist(summary.portion_size);
  title('Что понравилось из ассортимента'); dist(summary.favorites);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  const filename = `barburger-anketa-${new Date().toISOString().slice(0, 10)}.xlsx`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
});

// ---------- Статика ----------

app.get(['/admin', '/admin/'], (req, res) => res.redirect('/admin/login.html'));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`Барбургер-анкета запущена: http://localhost:${PORT}`);
  console.log(`Админка: http://localhost:${PORT}/admin/login.html`);
});
