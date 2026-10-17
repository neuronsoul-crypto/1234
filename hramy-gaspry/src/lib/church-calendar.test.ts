import { describe, expect, it } from 'vitest'

import { dayInfo, paschaKey } from './church-calendar'

describe('церковный календарь', () => {
  it('Пасха', () => {
    expect(paschaKey(2024)).toBe('2024-05-05')
    expect(paschaKey(2025)).toBe('2025-04-20')
    expect(paschaKey(2026)).toBe('2026-04-12')
    expect(paschaKey(2027)).toBe('2027-05-02')
  })
  it('праздники и посты', () => {
    expect(dayInfo('2027-01-07').feast?.rank).toBe('twelve')
    expect(dayInfo('2026-04-05').feast?.title).toMatch(/Вход Господень/)
    expect(dayInfo('2026-12-01').fasting).toBe('Рождественский пост')
    expect(dayInfo('2026-04-14').fasting).toMatch(/Светлая/)
    expect(dayInfo('2026-03-01').week).toBe('Неделя 1-я Великого поста')
    expect(dayInfo('2026-02-23').week).toBe('Седмица 1-я Великого поста')
    expect(dayInfo('2026-06-07').week).toBe('Неделя 1-я по Пятидесятнице')
    expect(dayInfo('2026-10-17').julian).toBe('2026-10-04')
  })
})
