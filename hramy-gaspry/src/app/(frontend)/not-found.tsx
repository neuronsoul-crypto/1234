import { ButtonLink } from '@/components/ui/Button'
import { LogoMark } from '@/components/ui/Logo'

export default function NotFound() {
  return (
    <div className="container-text py-32 text-center">
      <LogoMark size={56} className="mx-auto text-gold" />
      <p className="path-label mt-8">/404</p>
      <h1 className="mt-3 text-h1">Страница не найдена</h1>
      <p className="mt-4 text-ink-2">Возможно, адрес изменился. Начните с главной или посмотрите расписание.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">На главную</ButtonLink>
        <ButtonLink href="/raspisanie" variant="secondary">
          Расписание
        </ButtonLink>
      </div>
    </div>
  )
}
