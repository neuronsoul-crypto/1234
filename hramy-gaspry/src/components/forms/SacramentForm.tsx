'use client'
import { useActionState } from 'react'

import { submitSacrament, type FormState } from '@/app/(frontend)/actions'
import { Button } from '@/components/ui/Button'
import { ConsentField, FormField, Honeypot, TextareaField } from '@/components/ui/FormField'

import { keepValuesOnSubmit } from './useKeepValues'

const initial: FormState = { ok: false, message: '' }

export function SacramentForm({ sacrament, cta = 'Записаться' }: { sacrament: string; cta?: string }) {
  const [state, action, pending] = useActionState(submitSacrament, initial)
  if (state.ok) {
    return (
      <div role="status" className="border-l-2 border-nina bg-surface p-6">
        <p className="text-h3 font-display">{state.message}</p>
      </div>
    )
  }
  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="relative space-y-6" noValidate>
      <Honeypot />
      <input type="hidden" name="sacrament" value={sacrament} />
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Имя" name="contactName" required autoComplete="name" error={state.errors?.contactName} />
        <FormField
          label="Телефон"
          name="contactPhone"
          type="tel"
          required
          autoComplete="tel"
          error={state.errors?.contactPhone}
        />
      </div>
      <FormField label="Желаемая дата" name="date" type="date" hint="Точную дату согласуем по телефону" />
      <TextareaField label="Комментарий" name="comment" hint="Например: крещение младенца, имя ребёнка, вопросы" />
      <ConsentField error={state.errors?.consent} />
      {state.message ? (
        <p role="alert" className="font-medium text-feast">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Отправляем…' : cta}
      </Button>
    </form>
  )
}
