import type { ComponentProps, ReactNode } from 'react'

const control =
  'block w-full min-h-12 rounded-btn border border-ink-2/50 bg-surface px-4 py-3 text-[1.0625rem] text-ink placeholder:text-ink-2/70 focus:border-lazur focus:outline-none focus-visible:outline-3 focus-visible:outline-lazur aria-[invalid=true]:border-feast'

type Base = { label: string; name: string; hint?: ReactNode; error?: string; required?: boolean; className?: string }

function Wrapper({ label, name, hint, error, required, className = '', children }: Base & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 block text-[1rem] font-medium">
        {label}
        {required ? <span className="text-feast"> *</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${name}-hint`} className="mt-1.5 text-small text-ink-2">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-small font-medium text-feast" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const describedBy = (name: string, hint?: ReactNode, error?: string) =>
  [hint ? `${name}-hint` : '', error ? `${name}-error` : ''].filter(Boolean).join(' ') || undefined

export function FormField({ label, name, hint, error, required, className, ...input }: Base & ComponentProps<'input'>) {
  return (
    <Wrapper {...{ label, name, hint, error, required, className }}>
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={control}
        {...input}
      />
    </Wrapper>
  )
}

export function TextareaField({ label, name, hint, error, required, className, ...input }: Base & ComponentProps<'textarea'>) {
  return (
    <Wrapper {...{ label, name, hint, error, required, className }}>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={control}
        {...input}
      />
    </Wrapper>
  )
}

export function SelectField({
  label,
  name,
  hint,
  error,
  required,
  className,
  options,
  ...input
}: Base & ComponentProps<'select'> & { options: Array<{ value: string; label: string }> }) {
  return (
    <Wrapper {...{ label, name, hint, error, required, className }}>
      <select
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={`${control} appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235E5850' stroke-width='1.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...input}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  )
}

/** Радиокнопки-«чипы»: крупные, удобные для пальца. */
export function ChoiceField({
  label,
  name,
  options,
  defaultValue,
  required,
  onChange,
}: {
  label: string
  name: string
  options: Array<{ value: string; label: string; hint?: string }>
  defaultValue?: string
  required?: boolean
  onChange?: (value: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 block text-[1rem] font-medium">
        {label}
        {required ? <span className="text-feast"> *</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="relative inline-flex min-h-12 cursor-pointer items-center rounded-btn border border-ink-2/50 px-4 has-[:checked]:border-lazur has-[:checked]:bg-lazur has-[:checked]:text-lazur-ink has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-lazur"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={defaultValue === o.value}
              required={required}
              onChange={onChange ? (e) => onChange(e.target.value) : undefined}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** Согласие на обработку ПДн — по 152-ФЗ не отмечено по умолчанию. */
export function ConsentField({ error }: { error?: string }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-[1rem]">
        <input
          type="checkbox"
          name="consent"
          value="yes"
          required
          className="mt-1 size-5 shrink-0 accent-[var(--c-lazur)]"
          aria-invalid={error ? true : undefined}
        />
        <span>
          Я согласен(на) на обработку персональных данных в соответствии с{' '}
          <a href="/politika" target="_blank" className="text-lazur underline">
            политикой обработки ПДн
          </a>
          .
        </span>
      </label>
      {error ? (
        <p className="mt-1.5 text-small font-medium text-feast" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Скрытое поле-ловушка для спам-ботов. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Не заполняйте это поле
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}
