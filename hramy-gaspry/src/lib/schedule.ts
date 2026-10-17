import type { ServiceItem } from './types'

/** Службы, сгруппированные по дням, в исходном порядке. */
export function groupByDay(services: ServiceItem[]): Array<[string, ServiceItem[]]> {
  const map = new Map<string, ServiceItem[]>()
  for (const s of services) {
    const list = map.get(s.date) ?? []
    list.push(s)
    map.set(s.date, list)
  }
  return [...map.entries()]
}
