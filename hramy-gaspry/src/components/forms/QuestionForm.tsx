'use client'
import { useActionState } from 'react'

import { submitQuestion, type FormState } from '@/app/(frontend)/actions'
import { Button } from '@/components/ui/Button'
import { ConsentField, FormField, Honeypot, TextareaField } from '@/components/ui/FormField'

import { keepValuesOnSubmit } from './useKeepValues'

const initial: FormState = { ok: false, message: '' }

export function QuestionForm() {
  const [state, action, pending] = useActionState(submitQuestion, initial)
  if (state.ok)
    return (
      <p role="status" className="border-l-2 border-nina bg-surface p-6 text-[1.125rem]">
        {state.message}
      </p>
    )
  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="relative space-y-6" noValidate>
      <Honeypot />
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Имя" name="contactName" autoComplete="name" />
        <FormField label="Телефон или e-mail" name="contact" required error={state.errors?.contact} />
      </div>
      <TextareaField label="Вопрос" name="question" required error={state.errors?.question} />
      <ConsentField error={state.errors?.consent} />
      {state.message ? (
        <p role="alert" className="font-medium text-feast">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Отправляем…' : 'Задать вопрос'}
      </Button>
    </form>
  )
}
