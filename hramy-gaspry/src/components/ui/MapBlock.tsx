'use client'
import { MapPin, Navigation } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

export type MapChurch = {
  id: number
  name: string
  shortName: string
  address: string
  color: string
  lat?: number | null
  lng?: number | null
  orgId?: string | null
}

type YMaps = {
  ready: (cb: () => void) => void
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => { geoObjects: { add: (o: unknown) => void }; setBounds: (b: number[][], o?: Record<string, unknown>) => void }
  Placemark: new (coords: number[], props: Record<string, unknown>, opts: Record<string, unknown>) => unknown
}

const COLORS: Record<string, string> = { nina: '#7A8C6E', stena: '#1F4E79', gold: '#B08A3E' }

const orgUrl = (c: MapChurch) =>
  c.orgId ? `https://yandex.ru/maps/org/${c.orgId}/` : `https://yandex.ru/maps/?text=${encodeURIComponent(c.address)}`
const routeUrl = (c: MapChurch) =>
  c.lat && c.lng
    ? `https://yandex.ru/maps/?rtext=~${c.lat},${c.lng}&rtt=auto`
    : `https://yandex.ru/maps/?rtext=~${encodeURIComponent(c.address)}`

/**
 * Карта с метками храмов. Загружается только по нажатию — без лишних запросов
 * к сторонним серверам и без потери скорости страницы.
 * С ключом JS API и координатами — одна карта с двумя метками;
 * без них — виджет организации Яндекс.Карт.
 */
export function MapBlock({ churches, apiKey }: { churches: MapChurch[]; apiKey?: string }) {
  const [active, setActive] = useState(false)
  const [tab, setTab] = useState(0)
  const mapRef = useRef<HTMLDivElement>(null)
  const withCoords = useMemo(() => churches.filter((c) => c.lat && c.lng), [churches])
  const useApi = Boolean(apiKey) && withCoords.length > 0

  useEffect(() => {
    if (!active || !useApi || !mapRef.current) return
    const init = () => {
      const ymaps = (window as unknown as { ymaps?: YMaps }).ymaps
      if (!ymaps || !mapRef.current) return
      ymaps.ready(() => {
        const map = new ymaps.Map(mapRef.current!, {
          center: [withCoords[0].lat, withCoords[0].lng],
          zoom: 16,
          controls: ['zoomControl', 'routeButtonControl'],
        })
        for (const c of withCoords) {
          map.geoObjects.add(
            new ymaps.Placemark(
              [c.lat!, c.lng!],
              { balloonContentHeader: c.name, balloonContentBody: c.address, hintContent: c.shortName },
              { preset: 'islands#dotIcon', iconColor: COLORS[c.color] ?? '#1F4E79' },
            ),
          )
        }
        if (withCoords.length > 1)
          map.setBounds(
            withCoords.map((c) => [c.lat!, c.lng!]),
            { checkZoomRange: true, zoomMargin: 60 },
          )
      })
    }
    if ((window as unknown as { ymaps?: YMaps }).ymaps) return init()
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
    script.async = true
    script.onload = init
    document.head.appendChild(script)
  }, [active, useApi, apiKey, withCoords])

  const current = churches[tab]

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden border border-line bg-surface sm:aspect-[16/9]">
        {active ? (
          useApi ? (
            <div ref={mapRef} className="absolute inset-0" aria-label="Карта с храмами" />
          ) : current?.orgId ? (
            <iframe
              key={current.id}
              title={`Карта: ${current.name}`}
              src={`https://yandex.ru/map-widget/v1/?oid=${current.orgId}&z=17`}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-ink-2">
              Координаты храма пока не указаны.
            </p>
          )
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-2 hover:text-ink"
          >
            <svg aria-hidden viewBox="0 0 400 225" className="absolute inset-0 h-full w-full text-line" preserveAspectRatio="xMidYMid slice">
              <path d="M0 160 C80 140 120 180 200 150 S320 120 400 140" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M0 90 C100 70 160 110 240 80 S360 60 400 70" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M120 0 C130 60 110 120 140 225" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
            <MapPin size={36} strokeWidth={1.5} aria-hidden className="relative" />
            <span className="relative text-[1.0625rem] font-medium text-lazur underline underline-offset-4">Показать карту</span>
            <span className="relative text-small">Карта загружается с серверов Яндекса</span>
          </button>
        )}
      </div>
      <ul className="space-y-6">
        {churches.map((c, i) => (
          <li key={c.id} className="border-t border-line pt-4">
            <button
              type="button"
              onClick={() => {
                setTab(i)
                setActive(true)
              }}
              className={`flex items-start gap-3 text-left ${!useApi && tab === i && active ? 'text-lazur' : ''}`}
              aria-pressed={!useApi ? tab === i : undefined}
            >
              <span
                aria-hidden
                className={`mt-2 inline-block size-3 shrink-0 rounded-full ${c.color === 'nina' ? 'bg-nina' : c.color === 'stena' ? 'bg-stena' : 'bg-gold'}`}
              />
              <span>
                <span className="block font-medium">{c.name}</span>
                <span className="block text-small text-ink-2">{c.address}</span>
              </span>
            </button>
            <div className="mt-2 flex flex-wrap gap-x-4 pl-6 text-small">
              <a href={orgUrl(c)} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 text-lazur">
                <MapPin size={16} strokeWidth={1.5} aria-hidden /> В Яндекс.Картах
              </a>
              <a href={routeUrl(c)} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 text-lazur">
                <Navigation size={16} strokeWidth={1.5} aria-hidden /> Маршрут
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
