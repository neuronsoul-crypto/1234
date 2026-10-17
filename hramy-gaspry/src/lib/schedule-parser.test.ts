import { describe, expect, it } from 'vitest'

import { parseSchedule } from './schedule-parser'

const churches = [
  { id: 1, aliases: ['нины', 'нина', 'нине'] },
  { id: 2, aliases: ['нерушим', 'стена', 'стене'] },
]
const today = '2026-10-17'

describe('parseSchedule', () => {
  it('разбирает строки из ТЗ', () => {
    const res = parseSchedule(
      '18 окт, сб — 17:00 Всенощное бдение (Нерушимая Стена)\n19 окт, вс — 9:00 Божественная литургия (Нины)',
      { churches, today },
    )
    expect(res).toHaveLength(2)
    expect(res[0].errors).toEqual([])
    expect(res[0].services[0]).toMatchObject({
      date: '2026-10-18',
      time: '17:00',
      title: 'Всенощное бдение',
      type: 'vigil',
      churchId: 2,
    })
    expect(res[1].services[0]).toMatchObject({
      date: '2026-10-19',
      time: '09:00',
      title: 'Божественная литургия',
      type: 'liturgy',
      churchId: 1,
    })
  })

  it('понимает строку-дату и несколько служб в строке', () => {
    const res = parseSchedule(
      'Воскресенье, 26 октября\n8:30 Исповедь; 9:00 Божественная литургия (Нины)\n17:00 Акафист (исповедь после службы) (Стена)',
      { churches, today },
    )
    expect(res[0].dateOnly).toBe(true)
    expect(res[1].services).toHaveLength(2)
    expect(res[1].services.every((s) => s.churchId === 1 && s.date === '2026-10-26')).toBe(true)
    expect(res[2].services[0]).toMatchObject({ churchId: 2, note: 'исповедь после службы', type: 'akathist' })
  })

  it('предупреждает, если день недели не совпадает с датой', () => {
    const res = parseSchedule('19 окт, вс — 9:00 Божественная литургия (Нины)\n18 окт, вс — 9:00 Литургия (Нины)', { churches, today })
    expect(res[0].warnings[0]).toMatch(/понедельник/)
    expect(res[0].services).toHaveLength(1)
    expect(res[1].warnings).toEqual([])
  })

  it('числовые даты и переход года', () => {
    const res = parseSchedule('07.01 — 0:00 Божественная литургия (Нины)', { churches, today })
    expect(res[0].services[0].date).toBe('2027-01-07')
    expect(res[0].services[0].time).toBe('00:00')
  })

  it('подсвечивает нераспознанное', () => {
    const res = parseSchedule('Всенощное бдение\n40 окт — 17:00 Вечерня', { churches, today })
    expect(res[0].errors.length).toBeGreaterThan(0)
    expect(res[1].errors.length).toBeGreaterThan(0)
  })

  it('без храма — ошибка, с храмом по умолчанию — нет', () => {
    expect(parseSchedule('18 окт — 17:00 Вечерня', { churches, today })[0].errors).toHaveLength(1)
    const res = parseSchedule('18 окт — 17:00 Вечерня', { churches, today, defaultChurch: 1 })
    expect(res[0].errors).toHaveLength(0)
    expect(res[0].services[0].churchId).toBe(1)
  })
})
