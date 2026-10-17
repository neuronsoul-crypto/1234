/**
 * Расчётный православный календарь: Пасха, двунадесятые и великие праздники,
 * многодневные посты, сплошные седмицы, название седмицы.
 * Память святых здесь не вычисляется — её вносят в «Настройках» (см. TODO.md).
 */
import { addDays, diffDays, type DayKey, julianKey, utcDateToKey, weekdayOf } from './dates'

export type FeastRank = 'great' | 'twelve' | 'pascha'

export type Feast = { title: string; rank: FeastRank }

/** Пасха по новому стилю. */
export function paschaKey(year: number): DayKey {
  const a = year % 4
  const b = year % 7
  const c = year % 19
  const d = (19 * c + 15) % 30
  const e = (2 * a + 4 * b - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31)
  const day = ((d + e + 114) % 31) + 1
  const julian = new Date(Date.UTC(year, month - 1, day))
  julian.setUTCDate(julian.getUTCDate() + 13)
  return utcDateToKey(julian)
}

const FIXED_FEASTS: Record<string, Feast> = {
  '01-07': { title: 'Рождество Христово', rank: 'twelve' },
  '01-14': { title: 'Обрезание Господне. Свт. Василия Великого', rank: 'great' },
  '01-19': { title: 'Святое Богоявление. Крещение Господне', rank: 'twelve' },
  '02-15': { title: 'Сретение Господне', rank: 'twelve' },
  '04-07': { title: 'Благовещение Пресвятой Богородицы', rank: 'twelve' },
  '07-07': { title: 'Рождество Иоанна Предтечи', rank: 'great' },
  '07-12': { title: 'Святых первоверховных апостолов Петра и Павла', rank: 'great' },
  '08-19': { title: 'Преображение Господне', rank: 'twelve' },
  '08-28': { title: 'Успение Пресвятой Богородицы', rank: 'twelve' },
  '09-11': { title: 'Усекновение главы Иоанна Предтечи', rank: 'great' },
  '09-21': { title: 'Рождество Пресвятой Богородицы', rank: 'twelve' },
  '09-27': { title: 'Воздвижение Креста Господня', rank: 'twelve' },
  '10-14': { title: 'Покров Пресвятой Богородицы', rank: 'great' },
  '12-04': { title: 'Введение во храм Пресвятой Богородицы', rank: 'twelve' },
}

const MOVABLE_FEASTS: Record<number, Feast> = {
  [-7]: { title: 'Вход Господень в Иерусалим', rank: 'twelve' },
  0: { title: 'Светлое Христово Воскресение. Пасха', rank: 'pascha' },
  39: { title: 'Вознесение Господне', rank: 'twelve' },
  49: { title: 'День Святой Троицы. Пятидесятница', rank: 'twelve' },
}

export function feastOf(key: DayKey): Feast | undefined {
  const year = Number(key.slice(0, 4))
  const fromPascha = diffDays(key, paschaKey(year))
  return MOVABLE_FEASTS[fromPascha] ?? FIXED_FEASTS[key.slice(5)]
}

export type DayInfo = {
  key: DayKey
  julian: DayKey
  feast?: Feast
  /** Название периода: «Седмица 22-я по Пятидесятнице», «Светлая седмица»… */
  week: string
  /** Пост или сплошная седмица. */
  fasting: string
}

const ord = (n: number) => `${n}-я`

function weekName(key: DayKey): string {
  const year = Number(key.slice(0, 4))
  const pascha = paschaKey(year)
  const fromPascha = diffDays(key, pascha)
  const sunday = weekdayOf(key) === 0

  // Подготовительные недели и Великий пост
  if (fromPascha >= -70 && fromPascha < -48) {
    if (fromPascha === -70) return 'Неделя о мытаре и фарисее'
    if (fromPascha === -63) return 'Неделя о блудном сыне'
    if (fromPascha === -56) return 'Неделя мясопустная, о Страшном Суде'
    if (fromPascha === -49) return 'Неделя сыропустная. Воспоминание Адамова изгнания'
    if (fromPascha > -70 && fromPascha < -63) return 'Седмица о мытаре и фарисее'
    if (fromPascha > -63 && fromPascha < -56) return 'Седмица о блудном сыне'
    if (fromPascha > -56) return 'Сырная седмица (Масленица)'
  }
  if (fromPascha === -49) return 'Неделя сыропустная. Воспоминание Адамова изгнания'
  if (fromPascha > -49 && fromPascha < -7) {
    if (sunday) return `Неделя ${ord((fromPascha + 49) / 7)} Великого поста`
    return `Седмица ${ord(Math.floor((fromPascha + 48) / 7) + 1)} Великого поста`
  }
  if (fromPascha > -7 && fromPascha < 0) return 'Страстная седмица'
  if (fromPascha === -7) return 'Неделя ваий. Вход Господень в Иерусалим'
  if (fromPascha === 0) return 'Светлое Христово Воскресение'
  if (fromPascha > 0 && fromPascha < 7) return 'Светлая седмица'
  if (fromPascha >= 7 && fromPascha < 49) {
    if (sunday) return `Неделя ${ord(fromPascha / 7 + 1)} по Пасхе`
    return `Седмица ${ord(Math.floor(fromPascha / 7) + 1)} по Пасхе`
  }
  if (fromPascha === 49) return 'Пятидесятница'

  // Период по Пятидесятнице — считаем от Троицы текущего или прошлого года
  const pentecost =
    fromPascha > 49 ? addDays(pascha, 49) : addDays(paschaKey(year - 1), 49)
  const k = diffDays(key, pentecost)
  if (k > 0 && k < 7) return 'Седмица 1-я по Пятидесятнице (Троицкая)'
  if (sunday) return `Неделя ${ord(k / 7)} по Пятидесятнице`
  return `Седмица ${ord(Math.floor((k - 1) / 7) + 1)} по Пятидесятнице`
}

function fastingOf(key: DayKey): string {
  const year = Number(key.slice(0, 4))
  const pascha = paschaKey(year)
  const fromPascha = diffDays(key, pascha)
  const md = key.slice(5)
  const wd = weekdayOf(key)

  // Сплошные седмицы
  if (md >= '01-07' && md <= '01-17') return 'Святки — поста нет'
  if (fromPascha > -70 && fromPascha < -63) return 'Сплошная седмица — поста нет'
  if (fromPascha > -56 && fromPascha < -49) return 'Сырная седмица — без мяса'
  if (fromPascha > 0 && fromPascha < 7) return 'Светлая седмица — поста нет'
  if (fromPascha > 49 && fromPascha < 56) return 'Троицкая седмица — поста нет'

  // Многодневные посты
  if (fromPascha >= -48 && fromPascha < 0) return 'Великий пост'
  const petrovStart = addDays(pascha, 57)
  if (key >= petrovStart && md <= '07-11') return 'Петров пост'
  if (md >= '08-14' && md <= '08-27') return 'Успенский пост'
  if (md >= '11-28' || md <= '01-06') return 'Рождественский пост'

  // Однодневные посты
  if (md === '01-18') return 'Крещенский сочельник — постный день'
  if (md === '09-11') return 'Усекновение главы Иоанна Предтечи — постный день'
  if (md === '09-27') return 'Воздвижение Креста Господня — постный день'
  if (wd === 3 || wd === 5) return 'Постный день'
  return ''
}

export function dayInfo(key: DayKey): DayInfo {
  return {
    key,
    julian: julianKey(key),
    feast: feastOf(key),
    week: weekName(key),
    fasting: fastingOf(key),
  }
}
