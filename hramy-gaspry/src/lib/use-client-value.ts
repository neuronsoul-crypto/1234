'use client'
import { useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}

/**
 * Значение, доступное только в браузере (localStorage, адрес страницы, настройки системы).
 * На сервере и при гидратации — serverValue, затем — настоящее значение, без лишних эффектов.
 */
export function useClientValue<T>(get: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, get, () => serverValue)
}
