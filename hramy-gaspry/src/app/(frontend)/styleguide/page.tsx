import type { Metadata } from 'next'

import { DonateBlock, CampaignProgress } from '@/components/ui/DonateBlock'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button, ButtonLink } from '@/components/ui/Button'
import { AlbumCard, ChurchCard, NewsCard } from '@/components/ui/Cards'
import { ChurchTag } from '@/components/ui/ChurchTag'
import { DayGroup } from '@/components/ui/DayGroup'
import { FeastBadge } from '@/components/ui/FeastBadge'
import { FontSizeToggle } from '@/components/ui/FontSizeToggle'
import { ChoiceField, ConsentField, FormField, SelectField, TextareaField } from '@/components/ui/FormField'
import { Logo, LogoMark } from '@/components/ui/Logo'
import { MapBlock } from '@/components/ui/MapBlock'
import { Ornament } from '@/components/ui/Ornament'
import { Pagination } from '@/components/ui/Pagination'
import { PathLabel } from '@/components/ui/PathLabel'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { ServiceRow } from '@/components/ui/ServiceRow'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Timeline } from '@/components/ui/Timeline'
import { CopyButton } from '@/components/ui/CopyButton'
import type { LightboxPhoto } from '@/components/ui/Lightbox'
import type { ServiceItem } from '@/lib/types'
import type { Album, Church, Post, Setting } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Витрина компонентов',
  robots: { index: false, follow: false },
}

const nina = { id: 1, slug: 'svyatoy-niny', shortName: 'Св. Нины', name: 'Храм святой равноапостольной Нины', color: 'nina', address: 'Алупкинское ш., 46' }
const stena = { id: 2, slug: 'nerushimaya-stena', shortName: 'Нерушимая Стена', name: 'Церковь иконы Божией Матери «Нерушимая Стена»', color: 'stena', address: 'пгт Гаспра' }

const sample = (over: Partial<ServiceItem>): ServiceItem => ({
  id: 1,
  date: '2026-10-18',
  time: '17:00',
  title: 'Всенощное бдение',
  type: 'vigil',
  status: 'scheduled',
  feast: '',
  feastRank: 'none',
  note: '',
  celebrant: '',
  church: stena,
  ...over,
})

const photos: LightboxPhoto[] = [1, 2, 3].map((i) => ({
  id: i,
  src: `/styleguide/sample-${i}.webp`,
  full: `/styleguide/sample-${i}.webp`,
  width: i === 2 ? 800 : 1200,
  height: i === 2 ? 1000 : i === 3 ? 900 : 800,
  alt: `Образец фото ${i}`,
  caption: `Подпись к фото ${i}`,
}))

const post = {
  id: 1,
  title: 'Престольный праздник храма святой Нины',
  slug: 'styleguide',
  lead: 'Короткий лид новости в две строки: что, где и когда произойдёт.',
  category: 'sobytie',
  publishedAt: '2026-10-17T09:00:00.000Z',
} as unknown as Post

const album = {
  id: 1,
  title: 'Воскресная литургия',
  slug: 'styleguide',
  date: '2026-10-12T12:00:00.000Z',
  church: nina,
  photos: [],
} as unknown as Album

const church = { ...nina, intro: 'Построен в 1908 году вместе с усадьбой Харакс. Памятник архитектуры в кавказском стиле.', heroImages: [] } as unknown as Church

const settings = {
  campaign: { enabled: true, title: 'Реставрация кровли храма св. Нины', description: 'Пример сбора с прогресс-баром.', goal: 1500000, collected: 640000 },
  requisites: { recipient: '[TODO: наименование прихода]', inn: '0000000000', account: '00000000000000000000', bank: '[TODO: банк]', bik: '000000000', purpose: 'Пожертвование' },
} as unknown as Setting

function Showcase({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div data-theme={theme} className="min-w-0 space-y-16 bg-bg p-4 text-ink sm:p-10">
      <p className="path-label">/тема: {theme === 'light' ? 'светлая' : 'тёмная'}</p>

      <section className="space-y-4">
        <h2 className="text-h2">Цвета</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {['bg', 'surface', 'ink', 'ink-2', 'line', 'gold', 'gold-soft', 'gold-ink', 'lazur', 'feast', 'nina', 'stena'].map((c) => (
            <div key={c} className="text-small">
              <div className="h-14 border border-line" style={{ background: `var(--c-${c})` }} />
              <code>--c-{c}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-h2">Типографика</h2>
        <p className="font-display text-display leading-none">Гаспра</p>
        <h1 className="text-h1">Заголовок H1 — Cormorant Garamond</h1>
        <h2 className="text-h2">Заголовок H2</h2>
        <h3 className="text-h3">Заголовок H3</h3>
        <p className="measure">
          Основной текст — Onest, 18 px, межстрочный 1,6. Длина строки не больше 68 знаков, чтобы глазу было легко
          возвращаться к началу следующей строки.
        </p>
        <p className="text-small text-ink-2">Мелкий текст — 15 px, вторичный цвет.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2">Знак</h2>
        <div className="flex flex-wrap items-center gap-8">
          <Logo />
          <LogoMark size={24} />
          <LogoMark size={48} />
          <LogoMark size={96} className="text-gold" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-h2">Кнопки и метки</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Основная</Button>
          <Button variant="secondary">Контурная</Button>
          <Button variant="ghost">Текстовая</Button>
          <ButtonLink href="/pozhertvovaniya" variant="gold">
            Пожертвовать
          </ButtonLink>
          <Button disabled>Недоступна</Button>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <PathLabel>/расписание</PathLabel>
          <PathLabel href="/raspisanie">/ссылка-путь</PathLabel>
          <ChurchTag color="nina">Св. Нины</ChurchTag>
          <ChurchTag color="stena">Нерушимая Стена</ChurchTag>
          <FeastBadge rank="twelve" />
          <FeastBadge rank="great" />
          <CopyButton value="Пример" />
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <FontSizeToggle />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-h2">Расписание: DayGroup + ServiceRow</h2>
        <DayGroup date="2026-10-18" today="2026-10-18" level="h3">
          <ServiceRow service={sample({ id: 1 })} />
          <ServiceRow service={sample({ id: 2, time: '18:30', title: 'Акафист', church: nina, note: 'Исповедь после службы', celebrant: 'Иерей [TODO]' })} />
        </DayGroup>
        <DayGroup level="h3" date="2026-09-21" feast="Рождество Пресвятой Богородицы" feastRank="twelve">
          <ServiceRow service={sample({ id: 3, date: '2026-09-21', time: '9:00', title: 'Божественная литургия', church: nina })} />
          <ServiceRow service={sample({ id: 4, date: '2026-09-21', time: '17:00', title: 'Вечерня', status: 'cancelled' })} />
          <ServiceRow service={sample({ id: 5, date: '2026-09-21', time: '18:00', title: 'Молебен', status: 'moved', note: 'Перенесено с 17:00' })} />
        </DayGroup>
      </section>

      <section>
        <h2 className="mb-6 text-h2">Карточки</h2>
        <div className="grid gap-10 md:grid-cols-3">
          <NewsCard post={post} />
          <AlbumCard album={album} />
          <ChurchCard church={church} />
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-h2">Хронология</h2>
        <Timeline
          items={[
            { year: '1908', title: 'Построен храм при усадьбе Харакс' },
            { year: '1912', title: 'Завершена отделка' },
            { year: '2011', title: 'Возобновлены богослужения' },
          ]}
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-h2">Пожертвования</h2>
        <CampaignProgress settings={settings} />
        <DonateBlock settings={settings} compact />
      </section>

      <section className="max-w-xl space-y-6">
        <h2 className="text-h2">Поля форм</h2>
        <FormField label="Имя" name={`sg-name-${theme}`} hint="Подсказка под полем" />
        <FormField label="Телефон" name={`sg-phone-${theme}`} required error="Проверьте номер телефона" defaultValue="+7 9" />
        <SelectField label="Храм" name={`sg-church-${theme}`} options={[{ value: '1', label: 'Храм св. Нины' }, { value: '2', label: '«Нерушимая Стена»' }]} />
        <ChoiceField label="Записка" name={`sg-type-${theme}`} defaultValue="z" options={[{ value: 'z', label: 'О здравии' }, { value: 'u', label: 'О упокоении' }]} />
        <TextareaField label="Комментарий" name={`sg-comment-${theme}`} />
        <ConsentField />
        <div role="status" className="flex items-center gap-3 border border-nina bg-surface px-4 py-3">
          Toast: сообщение об успешном действии
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-h2">Навигация</h2>
        <Breadcrumbs items={[{ label: 'Новости', href: '/novosti' }, { label: 'Статья' }]} />
        <Pagination page={2} totalPages={4} hrefFor={(p) => `/novosti?stranica=${p}`} />
      </section>

      <section>
        <h2 className="mb-6 text-h2">Фото и лайтбокс</h2>
        <PhotoGrid photos={photos} allowDownload />
      </section>

      <section>
        <h2 className="mb-6 text-h2">Карта</h2>
        <MapBlock churches={[{ ...nina, orgId: '51256702894' }, { ...stena, orgId: '107869765848' }]} />
      </section>

      <Ornament />
    </div>
  )
}

export default function StyleguidePage() {
  return (
    <div className="container-site py-12">
      <PathLabel>/styleguide</PathLabel>
      <h1 className="mt-3 text-h1">Дизайн-система «Камень и мозаика»</h1>
      <p className="mt-4 text-ink-2 measure">Все компоненты сайта в светлой и тёмной теме. Страница закрыта от индексации.</p>
      <div className="mt-12 grid grid-cols-1 gap-px bg-line 2xl:grid-cols-2">
        <Showcase theme="light" />
        <Showcase theme="dark" />
      </div>
    </div>
  )
}
