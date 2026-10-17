import type { Church, Media } from '@/payload-types'

import { absoluteUrl } from './site'
import type { ServiceItem } from './types'

export function churchJsonLd(c: Church) {
  const image = (c.heroImages ?? []).find((m): m is Media => typeof m === 'object' && Boolean(m?.url))
  return {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: c.name,
    url: absoluteUrl(`/hramy/${c.slug}`),
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.address,
      addressLocality: 'пгт Гаспра, Ялта',
      addressRegion: 'Крым',
      addressCountry: 'RU',
    },
    ...(c.lat && c.lng ? { geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng } } : {}),
    ...(image ? { image: absoluteUrl(image.url!) } : {}),
    ...(c.yandexOrgId ? { sameAs: [`https://yandex.ru/maps/org/${c.yandexOrgId}/`] } : {}),
  }
}

export function serviceEventsJsonLd(services: ServiceItem[]) {
  return services
    .filter((s) => s.status !== 'cancelled')
    .map((s) => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: s.title,
      startDate: `${s.date}T${s.time}:00+03:00`,
      eventStatus: s.status === 'moved' ? 'https://schema.org/EventRescheduled' : 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      isAccessibleForFree: true,
      location: {
        '@type': 'Church',
        name: s.church.name,
        address: { '@type': 'PostalAddress', streetAddress: s.church.address, addressLocality: 'пгт Гаспра', addressCountry: 'RU' },
      },
      organizer: { '@type': 'Organization', name: 'Приход храмов Гаспры', url: absoluteUrl('/') },
      ...(s.note ? { description: s.note } : {}),
    }))
}
