'use client'
import { Minus, Plus } from 'lucide-react'
import { type ReactNode, useActionState, useState } from 'react'

import { submitZapiska, type FormState } from '@/app/(frontend)/actions'
import { Button } from '@/components/ui/Button'
import { ChoiceField, ConsentField, FormField, Honeypot, SelectField } from '@/components/ui/FormField'

import { keepValuesOnSubmit } from './useKeepValues'

const KINDS = {
  zdravie: [
    { value: 'proskomidiya', label: 'Проскомидия (на литургии)' },
    { value: 'moleben', label: 'Молебен' },
    { value: 'sorokoust', label: 'Сорокоуст' },
    { value: 'godovoe', label: 'Поминовение в течение года' },
  ],
  upokoenie: [
    { value: 'proskomidiya', label: 'Проскомидия (на литургии)' },
    { value: 'panikhida', label: 'Панихида' },
    { value: 'sorokoust', label: 'Сорокоуст' },
    { value: 'godovoe', label: 'Поминовение в течение года' },
  ],
}

const initial: FormState = { ok: false, message: '' }

export function ZapiskaForm({ churches, after }: { churches: Array<{ id: number; name: string }>; after?: ReactNode }) {
  const [state, action, pending] = useActionState(submitZapiska, initial)
  const [type, setType] = useState<'zdravie' | 'upokoenie'>('zdravie')
  const [names, setNames] = useState<string[]>(['', '', ''])

  if (state.ok) {
    return (
      <div role="status" className="space-y-10">
        <div className="border-l-2 border-nina bg-surface p-6">
          <h2 className="text-h3">{state.message}</h2>
          <p className="mt-2 text-ink-2">
            Пожертвование за записку можно сделать по QR-коду или реквизитам ниже — или в храме.
          </p>
        </div>
        {after}
      </div>
    )
  }

  return (
    <form action={action} onSubmit={keepValuesOnSubmit(action)} className="relative space-y-8" noValidate>
      <Honeypot />
      <ChoiceField
        label="Записка"
        name="type"
        defaultValue="zdravie"
        required
        onChange={(v) => setType(v as 'zdravie' | 'upokoenie')}
        options={[
          { value: 'zdravie', label: 'О здравии' },
          { value: 'upokoenie', label: 'О упокоении' },
        ]}
      />
      <SelectField
        key={type}
        label="Вид поминовения"
        name="kind"
        required
        options={KINDS[type]}
        error={state.errors?.kind}
      />
      <SelectField
        label="Храм"
        name="church"
        options={churches.map((c) => ({ value: String(c.id), label: c.name }))}
      />

      <fieldset>
        <legend className="mb-1 block text-[1rem] font-medium">
          Имена <span className="text-feast">*</span>
        </legend>
        <p id="names-hint" className="mb-3 text-small text-ink-2">
          По одному имени в поле, в родительном падеже, полные церковные имена: «Иоанна», «Марии», «младенца Николая».
        </p>
        <div className="space-y-2">
          {names.map((n, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-right text-small text-ink-2 lining-nums tabular-nums">{i + 1}.</span>
              <input
                name="names"
                value={n}
                onChange={(e) => setNames(names.map((v, j) => (j === i ? e.target.value : v)))}
                aria-label={`Имя ${i + 1}`}
                aria-describedby="names-hint"
                autoComplete="off"
                className="block min-h-12 w-full rounded-btn border border-ink-2/50 bg-surface px-4 py-3 text-[1.0625rem] focus:border-lazur focus:outline-none"
              />
              {names.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setNames(names.filter((_, j) => j !== i))}
                  className="tap inline-flex shrink-0 items-center justify-center rounded-btn text-ink-2 hover:bg-ink/5"
                  aria-label={`Убрать имя ${i + 1}`}
                >
                  <Minus size={18} strokeWidth={1.5} aria-hidden />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {names.length < 30 ? (
          <button
            type="button"
            onClick={() => setNames([...names, ''])}
            className="tap mt-3 inline-flex items-center gap-2 rounded-btn px-2 text-lazur hover:bg-lazur/5"
          >
            <Plus size={18} strokeWidth={1.5} aria-hidden /> Добавить имя
          </button>
        ) : null}
        {state.errors?.names ? (
          <p className="mt-2 text-small font-medium text-feast" role="alert">
            {state.errors.names}
          </p>
        ) : null}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Ваше имя" name="contactName" autoComplete="name" hint="Необязательно" />
        <FormField
          label="Телефон"
          name="contactPhone"
          type="tel"
          autoComplete="tel"
          hint="Необязательно — на случай вопросов"
          error={state.errors?.contactPhone}
        />
      </div>
      <ConsentField error={state.errors?.consent} />
      {state.message && !state.ok ? (
        <p role="alert" className="font-medium text-feast">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? 'Отправляем…' : 'Подать записку'}
      </Button>
    </form>
  )
}
