export const SERVICE_TYPES = [
  { value: 'liturgy', label: 'Литургия' },
  { value: 'vigil', label: 'Всенощное бдение' },
  { value: 'vespers', label: 'Вечерня' },
  { value: 'matins', label: 'Утреня' },
  { value: 'moleben', label: 'Молебен' },
  { value: 'panikhida', label: 'Панихида' },
  { value: 'akathist', label: 'Акафист' },
  { value: 'sacrament', label: 'Таинство' },
  { value: 'other', label: 'Другое' },
] as const

export type ServiceType = (typeof SERVICE_TYPES)[number]['value']

export const FEAST_RANKS = [
  { value: 'none', label: 'Обычный день' },
  { value: 'great', label: 'Великий праздник' },
  { value: 'twelve', label: 'Двунадесятый праздник' },
] as const

export type FeastRankValue = (typeof FEAST_RANKS)[number]['value']

export const SERVICE_STATUSES = [
  { value: 'scheduled', label: 'По расписанию' },
  { value: 'cancelled', label: 'Отменена' },
  { value: 'moved', label: 'Перенесена' },
] as const

const TYPE_KEYWORDS: Array<[RegExp, ServiceType]> = [
  [/литурги/i, 'liturgy'],
  [/всенощн|бдени/i, 'vigil'],
  [/вечерн|повечери/i, 'vespers'],
  [/утрен/i, 'matins'],
  [/молеб|водосвят/i, 'moleben'],
  [/панихид|лити[яи]|парастас/i, 'panikhida'],
  [/акафист/i, 'akathist'],
  [/крещен|венчан|исповед|соборован|отпеван|причащ/i, 'sacrament'],
]

export function guessServiceType(title: string): ServiceType {
  for (const [re, type] of TYPE_KEYWORDS) if (re.test(title)) return type
  return 'other'
}

export const serviceTypeLabel = (type?: string | null) =>
  SERVICE_TYPES.find((t) => t.value === type)?.label ?? ''
