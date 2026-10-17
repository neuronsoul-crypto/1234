/**
 * Демо-данные: npm run seed  (повторный запуск с очисткой: npm run seed -- --reset)
 * Всё, чего нет в ТЗ, помечено [TODO] — заказчик заменит это в админке.
 */
import crypto from 'node:crypto'

import config from '@payload-config'
import { getPayload, type CollectionSlug } from 'payload'

import { addDays, keyToStored, mondayOf, todayKey } from '../lib/dates'
import { doc, h, p, quote, ul } from './lexical'
import { placeholderJpeg } from './placeholder'

const ctx = { disableRevalidate: true, skipAudit: true, skipNotify: true, skipTelegram: true }

const payload = await getPayload({ config })
const reset = process.argv.includes('--reset')

const existing = await payload.count({ collection: 'churches' })
if (existing.totalDocs > 0 && !reset) {
  payload.logger.info('Данные уже есть. Для пересоздания: npm run seed -- --reset')
  process.exit(0)
}

if (reset) {
  const order: CollectionSlug[] = [
    'audit-log',
    'requests',
    'services',
    'schedule-templates',
    'service-titles',
    'posts',
    'albums',
    'clergy',
    'sacraments',
    'pages',
    'churches',
    'media',
  ]
  for (const collection of order) {
    await payload.delete({ collection, where: { id: { exists: true } }, trash: true, overrideAccess: true, context: ctx })
  }
  payload.logger.info('Старые данные удалены')
}

let variant = 0
async function image(alt: string, opts: { w?: number; h?: number; caption?: string; year?: string; source?: string; church?: boolean } = {}) {
  const data = await placeholderJpeg(opts.w ?? 1600, opts.h ?? 1067, variant++, opts.church ?? true)
  const doc = await payload.create({
    collection: 'media',
    data: { alt, caption: opts.caption, year: opts.year, source: opts.source },
    file: { data, mimetype: 'image/jpeg', name: `demo-${variant}.jpg`, size: data.length },
    context: ctx,
  })
  return doc.id
}

// ── Пользователи ──────────────────────────────────────────────
const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url')
const users = [
  { email: 'admin@example.ru', name: 'Администратор', role: 'admin' as const },
  { email: 'editor@example.ru', name: 'Редактор', role: 'editor' as const },
  { email: 'clergy@example.ru', name: 'Священник', role: 'clergy' as const },
]
for (const u of users) {
  const found = await payload.find({ collection: 'users', where: { email: { equals: u.email } }, limit: 1 })
  if (found.docs[0]) {
    await payload.update({ collection: 'users', id: found.docs[0].id, data: { ...u, password }, context: ctx })
  } else {
    await payload.create({ collection: 'users', data: { ...u, password }, context: ctx })
  }
}

// ── Храмы ─────────────────────────────────────────────────────
const ninaHero = [
  await image('Храм святой Нины — общий вид (заглушка, фото будет заменено)', { w: 1920, h: 1280 }),
  await image('Храм святой Нины — вид с моря (заглушка)', { w: 1920, h: 1280 }),
  await image('Храм святой Нины — вечер (заглушка)', { w: 1920, h: 1280 }),
]
const stenaHero = [await image('Церковь «Нерушимая Стена» (заглушка)', { w: 1600, h: 2000 })]

const nina = await payload.create({
  collection: 'churches',
  context: ctx,
  data: {
    name: 'Храм святой равноапостольной Нины',
    shortName: 'Св. Нины',
    slug: 'svyatoy-niny',
    color: 'nina',
    aliases: 'нин, нины, нине',
    order: 1,
    heroImages: ninaHero,
    intro:
      'Построен в 1908 году вместе с усадьбой Харакс, отделка завершена к 1912 году. Памятник архитектуры в кавказском (армяно-грузинском) стиле. Богослужения возобновлены в 2011 году.',
    facts: [
      { label: 'Построен', value: '1908, вместе с усадьбой Харакс' },
      { label: 'Отделка завершена', value: 'к 1912 году' },
      { label: 'Стиль', value: 'кавказский (армяно-грузинский)' },
      { label: 'Архитектор', value: '[TODO]' },
      { label: 'Статус', value: 'памятник архитектуры [TODO: уровень охраны]' },
      { label: 'Богослужения', value: 'возобновлены в 2011 году' },
    ],
    history: [
      { blockType: 'timelineItem', year: '1908', title: 'Храм построен вместе с усадьбой Харакс' },
      { blockType: 'timelineItem', year: '1912', title: 'Завершена внутренняя отделка' },
      { blockType: 'timelineItem', year: '2011', title: 'Возобновлены богослужения' },
      {
        blockType: 'richText',
        body: doc(p('[TODO: подробная история храма — текст и источники от заказчика.]')),
      },
    ],
    architecture: doc(
      p('Храм построен в кавказском (армяно-грузинском) стиле и является памятником архитектуры.'),
      p('[TODO: описание архитектуры, резьбы по камню, интерьера — от заказчика.]'),
    ),
    shrines: [{ title: '[TODO: святыня храма]', text: 'Описание святыни будет добавлено.' }],
    patronalFeasts: [
      {
        date: '27 января',
        title: 'Память святой равноапостольной Нины, просветительницы Грузии',
        note: '14 января по старому стилю',
      },
    ],
    address: 'Алупкинское ш., 46, пгт Гаспра',
    yandexOrgId: '51256702894',
    openingHours: '[TODO: часы, когда храм открыт]',
    howToGet: doc(p('[TODO: как пройти от остановки и где оставить машину.]')),
  },
})

const stena = await payload.create({
  collection: 'churches',
  context: ctx,
  data: {
    name: 'Церковь иконы Божией Матери «Нерушимая Стена»',
    shortName: 'Нерушимая Стена',
    slug: 'nerushimaya-stena',
    color: 'stena',
    aliases: 'нерушим, стена, стене, стену',
    order: 2,
    heroImages: stenaHero,
    intro: 'Построена рядом с храмом святой Нины как временный храм для прихожан. Сейчас — действующий храм с регулярными службами.',
    facts: [
      { label: 'Освящён', value: '[TODO]' },
      { label: 'Расположение', value: 'рядом с храмом святой Нины' },
    ],
    history: [
      {
        blockType: 'richText',
        body: doc(
          p('Церковь построена рядом с храмом святой Нины как временный храм для прихожан, а сегодня это действующий храм с регулярными богослужениями.'),
          p('[TODO: история строительства и освящения — от заказчика.]'),
        ),
      },
    ],
    extraSection: {
      heading: 'Икона «Нерушимая Стена»',
      body: doc(
        p('Храм освящён в честь образа Божией Матери «Нерушимая Стена» — мозаики в алтаре Софийского собора в Киеве. Богородица изображена стоящей на золотом фоне с воздетыми руками.'),
        p('[TODO: текст о смысле названия иконы и дни её празднования — от заказчика.]'),
      ),
    },
    patronalFeasts: [{ date: '[TODO: дата]', title: 'Празднование иконы Божией Матери «Нерушимая Стена»' }],
    address: 'пгт Гаспра, рядом с храмом святой Нины',
    yandexOrgId: '107869765848',
    openingHours: '[TODO: часы, когда храм открыт]',
  },
})

// ── Справочник служб ──────────────────────────────────────────
const titles: Array<[string, string]> = [
  ['Божественная литургия', 'liturgy'],
  ['Ранняя Божественная литургия', 'liturgy'],
  ['Поздняя Божественная литургия', 'liturgy'],
  ['Всенощное бдение', 'vigil'],
  ['Вечерня. Утреня', 'vespers'],
  ['Вечерня', 'vespers'],
  ['Утреня', 'matins'],
  ['Молебен', 'moleben'],
  ['Водосвятный молебен', 'moleben'],
  ['Панихида', 'panikhida'],
  ['Акафист', 'akathist'],
  ['Исповедь', 'sacrament'],
  ['Таинство Крещения', 'sacrament'],
  ['Таинство Соборования', 'sacrament'],
]
const titleIds = new Map<string, number>()
for (const [i, [title, type]] of titles.entries()) {
  const t = await payload.create({
    collection: 'service-titles',
    data: { title, type: type as 'liturgy', order: i },
    context: ctx,
  })
  titleIds.set(title, t.id)
}

// ── Шаблон недели (ДЕМО — заменить постоянным расписанием прихода) ──
const template: Array<{ weekday: string; time: string; title: string; church: number; note?: string }> = [
  { weekday: '3', time: '17:00', title: 'Акафист', church: stena.id },
  { weekday: '6', time: '9:00', title: 'Божественная литургия', church: stena.id },
  { weekday: '6', time: '17:00', title: 'Всенощное бдение', church: stena.id },
  { weekday: '7', time: '8:30', title: 'Исповедь', church: nina.id },
  { weekday: '7', time: '9:00', title: 'Божественная литургия', church: nina.id, note: 'Исповедь с 8:30' },
  { weekday: '7', time: '12:00', title: 'Молебен', church: nina.id },
]
for (const t of template) {
  await payload.create({
    collection: 'schedule-templates',
    data: {
      weekday: t.weekday as '1',
      time: t.time,
      church: t.church,
      preset: titleIds.get(t.title),
      title: t.title,
      note: t.note,
      active: true,
    },
    context: ctx,
  })
}

// ── Духовенство ───────────────────────────────────────────────
const rector = await payload.create({
  collection: 'clergy',
  context: ctx,
  data: { rank: '[TODO: сан]', name: '[TODO: имя настоятеля]', position: 'Настоятель', bio: '[TODO: краткая биография]', order: 1 },
})
await payload.create({
  collection: 'clergy',
  context: ctx,
  data: { rank: '[TODO: сан]', name: '[TODO: имя]', position: 'Клирик', order: 2 },
})

// ── Расписание на 3 недели (из демо-шаблона) ─────────────────
const monday = mondayOf(todayKey())
let created = 0
for (let w = 0; w < 3; w++) {
  for (const t of template) {
    const date = addDays(monday, w * 7 + Number(t.weekday) - 1)
    const special = w === 1 && t.weekday === '3'
    await payload.create({
      collection: 'services',
      context: ctx,
      data: {
        date: keyToStored(date),
        time: t.time,
        church: t.church,
        preset: titleIds.get(t.title),
        title: t.title,
        note: special ? 'Отменено по болезни священника (демо)' : t.note,
        status: special ? 'cancelled' : 'scheduled',
        celebrant: t.title === 'Божественная литургия' && t.church === nina.id ? rector.id : undefined,
        published: true,
      },
    })
    created++
  }
}
// перенесённая служба — для демонстрации
await payload.create({
  collection: 'services',
  context: ctx,
  data: {
    date: keyToStored(addDays(monday, 7 + 4)),
    time: '18:00',
    church: nina.id,
    title: 'Панихида',
    status: 'moved',
    note: 'Перенесено с 17:00 (демо)',
    published: true,
  },
})

// ── Таинства ──────────────────────────────────────────────────
const sacraments = [
  {
    title: 'Крещение',
    slug: 'kreschenie',
    intro: 'Таинство, через которое человек рождается в духовную жизнь и становится членом Церкви.',
    preparation: doc(
      p('Перед Крещением взрослым и восприемникам (крёстным) обычно предлагают пройти огласительные беседы. Крёстные должны быть крещёными православными людьми.'),
      ul(['Нательный крестик', 'Крестильная рубашка', 'Полотенце']),
      p('[TODO: порядок огласительных бесед в приходе.]'),
    ),
    documents: doc(p('Свидетельство о рождении ребёнка (для младенцев). [TODO: уточнить у настоятеля.]')),
    schedule: '[TODO: дни и время совершения Крещения]',
    contact: '[TODO: к кому обращаться, телефон]',
    cta: 'Записаться на Крещение',
    order: 1,
  },
  {
    title: 'Венчание',
    slug: 'venchanie',
    intro: 'Таинство, в котором Церковь благословляет супружеский союз мужчины и женщины.',
    preparation: doc(
      p('Венчаются крещёные православные, уже зарегистрировавшие брак в ЗАГСе. Перед Венчанием супруги исповедуются и причащаются.'),
      p('Венчание не совершается в дни постов, на Святках, в Светлую седмицу и в некоторые другие дни — дату нужно заранее согласовать со священником.'),
    ),
    documents: doc(p('Свидетельство о заключении брака. [TODO: уточнить у настоятеля.]')),
    schedule: '[TODO: дни совершения Венчания]',
    contact: '[TODO: к кому обращаться, телефон]',
    cta: 'Договориться о Венчании',
    order: 2,
  },
  {
    title: 'Исповедь и Причастие',
    slug: 'ispoved-i-prichastie',
    intro: 'Покаяние и соединение со Христом в таинстве Евхаристии.',
    preparation: doc(
      p('Перед Причастием принято поститься, прочитать молитвы ко Святому Причащению и прийти на исповедь. С полуночи перед литургией не едят и не пьют.'),
      p('Если вы готовитесь впервые или давно не причащались — подойдите к священнику, он подскажет.'),
    ),
    schedule: 'Исповедь — перед Божественной литургией. Смотрите расписание богослужений.',
    contact: 'Подойти к священнику в храме.',
    cta: '',
    order: 3,
  },
  {
    title: 'Отпевание',
    slug: 'otpevanie',
    intro: 'Чин погребения, в котором Церковь молится об упокоении души почившего.',
    preparation: doc(p('Отпевание совершается над крещёными православными. Время согласуется со священником заранее.')),
    documents: doc(p('Справка о смерти. [TODO: уточнить у настоятеля.]')),
    schedule: 'По договорённости.',
    contact: '[TODO: телефон для срочной связи]',
    cta: 'Договориться об отпевании',
    order: 4,
  },
  {
    title: 'Освящение',
    slug: 'osvyaschenie',
    intro: 'Освящение дома, квартиры, автомобиля, предметов — молитва о Божием благословении.',
    preparation: doc(p('Договоритесь со священником о дне и времени. [TODO: порядок в приходе.]')),
    schedule: 'По договорённости.',
    contact: '[TODO: к кому обращаться, телефон]',
    cta: 'Пригласить священника',
    order: 5,
  },
]
for (const s of sacraments) await payload.create({ collection: 'sacraments', data: s, context: ctx })

// ── Фотоальбомы ───────────────────────────────────────────────
async function album(title: string, slug: string, opts: { type: string; church?: number; days: number; photos: number; historical?: boolean; description?: string; allowDownload?: boolean }) {
  const ids: number[] = []
  for (let i = 0; i < opts.photos; i++) {
    const vertical = i % 3 === 1
    ids.push(
      await image(opts.historical ? `Историческое фото ${i + 1} (заглушка)` : `${title}: фото ${i + 1} (заглушка)`, {
        w: vertical ? 1200 : 1600,
        h: vertical ? 1600 : 1067,
        church: i % 2 === 0,
        caption: opts.historical ? '[TODO: подпись к историческому фото]' : undefined,
        year: opts.historical ? '[TODO: год]' : undefined,
        source: opts.historical ? '[TODO: источник]' : undefined,
      }),
    )
  }
  return payload.create({
    collection: 'albums',
    context: ctx,
    data: {
      title,
      slug,
      date: keyToStored(addDays(todayKey(), -opts.days)),
      type: opts.type as 'prihod',
      church: opts.church,
      description: opts.description,
      photos: ids,
      cover: ids[0],
      allowDownload: opts.allowDownload ?? false,
      _status: 'published',
    },
  })
}

const albumSunday = await album('Воскресная литургия (демо)', 'voskresnaya-liturgiya-demo', {
  type: 'bogosluzhenie',
  church: nina.id,
  days: 6,
  photos: 8,
  description: 'Демонстрационный альбом с заглушками вместо фотографий.',
  allowDownload: true,
})
await album('Праздничное богослужение (демо)', 'prazdnichnoe-bogosluzhenie-demo', { type: 'prazdnik', church: stena.id, days: 20, photos: 6 })
await album('Приходская жизнь (демо)', 'prihodskaya-zhizn-demo', { type: 'prihod', days: 45, photos: 6 })
await album('Исторические фото: Харакс и Гаспра', 'istoricheskie-foto', {
  type: 'istoricheskie',
  church: nina.id,
  days: 400,
  photos: 6,
  historical: true,
  description: 'Дореволюционные снимки усадьбы Харакс и храма. [TODO: фото и подписи с указанием источника — от заказчика.]',
})

// ── Новости ───────────────────────────────────────────────────
const posts = [
  {
    title: 'Сайт прихода начал работу',
    category: 'obyavlenie',
    lead: 'Демонстрационная новость. Здесь будут расписание богослужений обоих храмов, новости прихода и фотоархив.',
    body: [p('Это демонстрационная новость: она показывает, как выглядит статья на сайте.'), h('Что есть на сайте'), ul(['Расписание богослужений на две недели вперёд', 'Подача записок о здравии и о упокоении', 'Запись на таинства', 'Фотоархив'])],
  },
  {
    title: 'Расписание богослужений теперь можно добавить в календарь телефона',
    category: 'obyavlenie',
    lead: 'Демонстрационная новость. Подпишитесь на расписание — изменения появятся в календаре сами.',
    body: [p('На странице «Расписание» нажмите «Подписаться на расписание в календаре телефона». Календарь будет обновляться автоматически.')],
  },
  {
    title: 'Как подать записку через сайт',
    category: 'prihod',
    lead: 'Демонстрационная новость. Записку о здравии или о упокоении можно подать, не выходя из дома.',
    body: [p('Откройте раздел «Записки», выберите вид поминовения и впишите имена — каждое в отдельное поле, в родительном падеже.'), quote('Пример: «Иоанна», «Марии», «младенца Николая».')],
  },
  {
    title: 'Престольный праздник храма святой Нины',
    category: 'sobytie',
    church: nina.id,
    lead: 'Демонстрационная новость. 27 января — память святой равноапостольной Нины, просветительницы Грузии.',
    body: [p('[TODO: порядок праздничных богослужений — от заказчика.]')],
  },
  {
    title: 'Слово о молитве (демо)',
    category: 'propoved',
    lead: 'Демонстрационная запись в рубрике «Проповедь».',
    body: [p('[TODO: текст проповеди — от духовенства прихода.]')],
  },
  {
    title: 'Фотографии с воскресной литургии (демо)',
    category: 'sobytie',
    church: nina.id,
    lead: 'Демонстрационная новость со связанным фотоальбомом.',
    body: [p('Фотографии — в альбоме ниже. Сейчас вместо них заглушки.')],
    album: albumSunday.id,
  },
]
for (const [i, item] of posts.entries()) {
  const cover = await image(`${item.title} — обложка (заглушка)`, { w: 1600, h: 900, church: i % 2 === 0 })
  await payload.create({
    collection: 'posts',
    context: ctx,
    data: {
      title: item.title,
      category: item.category as 'obyavlenie',
      church: item.church,
      lead: item.lead,
      cover,
      album: item.album,
      content: doc(...item.body),
      publishedAt: new Date(Date.now() - i * 3 * 86_400_000).toISOString(),
      _status: 'published',
    },
  })
}

// ── Текстовые страницы ────────────────────────────────────────
await payload.create({
  collection: 'pages',
  context: ctx,
  data: {
    title: 'Паломникам и гостям',
    slug: 'palomnikam',
    pathLabel: '/паломникам',
    lead: 'Как добраться до храмов Гаспры, как вести себя в храме и что посмотреть рядом.',
    _status: 'published',
    layout: [
      {
        blockType: 'steps',
        heading: 'Как добраться',
        items: [
          { title: 'Из Ялты', text: '[TODO: маршрут общественного транспорта и на машине.]' },
          { title: 'Из Алупки', text: '[TODO: маршрут.]' },
          { title: 'От трассы', text: '[TODO: съезд и ориентиры.]' },
          { title: 'Парковка', text: '[TODO: где оставить машину.]' },
        ],
      },
      { blockType: 'map', heading: 'Храмы на карте' },
      {
        blockType: 'faq',
        heading: 'Правила посещения храма',
        items: [
          { question: 'Как одеться?', answer: 'Мужчинам — без головного убора, в длинных брюках. Женщинам — с покрытой головой, в юбке или платье ниже колена. Пляжная одежда в храме неуместна.' },
          { question: 'Можно ли фотографировать?', answer: '[TODO: правила фото- и видеосъёмки в храмах прихода.]' },
          { question: 'Когда открыт храм?', answer: '[TODO: часы работы.]' },
          { question: 'Мы приедем группой', answer: '[TODO: как заранее договориться о посещении группой — телефон.]' },
        ],
      },
      {
        blockType: 'cards',
        heading: 'Что рядом',
        items: [
          { title: 'Усадьба Харакс', text: 'Храм святой Нины построен вместе с усадьбой Харакс. [TODO: как посетить парк.]' },
          { title: '«Ласточкино гнездо»', text: 'Знаменитый замок на скале Аврора в Гаспре. [TODO: как дойти.]' },
        ],
      },
      { blockType: 'contacts', note: 'Для групп паломников — звоните заранее.' },
    ],
  },
})
await payload.create({
  collection: 'pages',
  context: ctx,
  data: {
    title: 'Приходская жизнь',
    slug: 'prihod',
    pathLabel: '/приход',
    lead: 'Чем живёт приход помимо богослужений.',
    _status: 'published',
    layout: [
      {
        blockType: 'cards',
        items: [
          { title: 'Воскресная школа', text: '[TODO: есть ли, расписание занятий.]' },
          { title: 'Хор', text: '[TODO: как присоединиться.]' },
          { title: 'Социальное служение', text: '[TODO: чем помогает приход и как участвовать.]' },
        ],
      },
      { blockType: 'callout', text: 'Хотите помочь приходу делом? Напишите нам через страницу «Контакты».', tone: 'lazur' },
    ],
  },
})
await payload.create({
  collection: 'pages',
  context: ctx,
  data: {
    title: 'Политика обработки персональных данных',
    slug: 'politika',
    pathLabel: '/политика',
    _status: 'published',
    layout: [
      {
        blockType: 'text',
        body: doc(
          p('Настоящая политика определяет порядок обработки персональных данных посетителей сайта в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».'),
          h('1. Оператор'),
          p('[TODO: полное наименование прихода, ИНН, ОГРН, адрес, e-mail для обращений по вопросам ПДн.]'),
          h('2. Какие данные мы обрабатываем'),
          ul(['имя и телефон или e-mail — из форм записи на таинства, подачи записок и вопросов;', 'имена для поминовения — из записок;', 'обезличенные данные о посещениях — через Яндекс.Метрику, только с вашего согласия.']),
          h('3. Цели обработки'),
          p('Ответ на обращения, запись на таинства и требы, поминовение за богослужением, улучшение работы сайта.'),
          h('4. Хранение'),
          p('Данные хранятся на сервере на территории Российской Федерации и не передаются третьим лицам, кроме случаев, предусмотренных законом. [TODO: срок хранения.]'),
          h('5. Ваши права'),
          p('Вы можете запросить сведения о своих данных, их уточнение или удаление, а также отозвать согласие, написав оператору. [TODO: адрес для обращений.]'),
          h('6. Cookie'),
          p('Сайт использует cookie Яндекс.Метрики только после вашего согласия в баннере. Отказаться можно в баннере или очистив данные сайта в браузере.'),
        ),
      },
    ],
  },
})

// ── Настройки сайта ───────────────────────────────────────────
await payload.updateGlobal({
  slug: 'settings',
  context: ctx,
  data: {
    parishName: '[TODO: официальное название прихода]',
    siteName: 'Храмы Гаспры',
    phones: [{ number: '+7 (000) 000-00-00', label: '[TODO: телефон прихода]' }],
    email: 'info@example.ru',
    shopHours: '[TODO: время работы храма и церковной лавки]',
    requisites: {
      recipient: '[TODO: наименование получателя]',
      inn: '[TODO]',
      kpp: '[TODO]',
      ogrn: '[TODO]',
      account: '[TODO]',
      bank: '[TODO]',
      bik: '[TODO]',
      corrAccount: '[TODO]',
      purpose: 'Добровольное пожертвование на уставную деятельность',
    },
    campaign: {
      enabled: true,
      title: 'Реставрация храма святой Нины (демо)',
      description: 'Демонстрационный сбор — цель и суммы меняются на главном экране админки.',
      goal: 1_000_000,
      collected: 350_000,
    },
    needs: [
      { title: '[TODO: нужда прихода]', text: 'Список нужд редактируется в «Настройках сайта».' },
    ],
    banner: { enabled: false, text: '' },
    notify: { emails: '' },
    metaDescription:
      'Храм святой равноапостольной Нины и церковь иконы Божией Матери «Нерушимая Стена» в Гаспре (Ялта, Крым): расписание богослужений, новости, таинства, записки, пожертвования.',
  },
})

payload.logger.info(`Готово: 2 храма, ${created + 1} служб, 6 новостей, 4 альбома, 5 таинств, 3 страницы.`)
payload.logger.info(`Вход в админку: admin@example.ru / editor@example.ru / clergy@example.ru, пароль: ${password}`)
process.exit(0)
