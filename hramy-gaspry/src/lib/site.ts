export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

/** Цветовые метки храмов (ключи соответствуют CSS-токенам --c-nina / --c-stena). */
export const CHURCH_COLORS = [
  { value: 'nina', label: 'Олива (храм св. Нины)' },
  { value: 'stena', label: 'Лазурь (храм «Нерушимая Стена»)' },
  { value: 'gold', label: 'Золото' },
] as const
