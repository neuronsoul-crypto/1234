'use client'
import { type FormEvent, startTransition } from 'react'

/**
 * React 19 очищает форму после серверного действия, и при ошибке проверки
 * человеку пришлось бы заполнять всё заново. Отправляем данные вручную — поля сохраняются.
 * Атрибут action на форме остаётся для работы без JavaScript.
 */
export const keepValuesOnSubmit = (action: (fd: FormData) => void) => (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const fd = new FormData(e.currentTarget)
  startTransition(() => action(fd))
}
