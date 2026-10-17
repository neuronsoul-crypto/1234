import { ZapiskaForm } from '@/components/forms/ZapiskaForm'
import { DonateBlock } from '@/components/ui/DonateBlock'
import { PageHeader } from '@/components/ui/PageHeader'
import { getChurches, getSettings } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

export const revalidate = 600

export const metadata = pageMeta({
  title: 'Подать записку',
  description: 'Подать записку о здравии или о упокоении в храмы Гаспры: проскомидия, молебен, сорокоуст, панихида.',
  path: '/zapiski',
})

export default async function ZapiskiPage() {
  const [churches, settings] = await Promise.all([getChurches(), getSettings()])
  return (
    <>
      <PageHeader
        path="/записки"
        title="Подать записку"
        lead="Записки о здравии и о упокоении читаются за богослужением. Впишите имена тех, о ком молитесь, — каждое в отдельное поле."
        crumbs={[{ label: 'Записки' }]}
      />
      <div className="container-site grid gap-16 lg:grid-cols-[1fr_22rem]">
        <div className="max-w-2xl">
          <ZapiskaForm
            churches={churches.map((c) => ({ id: c.id, name: c.name }))}
            after={<DonateBlock settings={settings} compact />}
          />
        </div>
        <aside className="space-y-6 text-ink-2 lg:border-l lg:border-line lg:pl-10">
          <h2 className="text-h3 text-ink">Как писать имена</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>В родительном падеже: «Иоанна», «Марии».</li>
            <li>Полные церковные имена: не «Юрия», а «Георгия»; не «Светланы», а «Фотинии».</li>
            <li>Детей до 7 лет — «младенца», до 15 — «отрока» или «отроковицы».</li>
            <li>В записках о здравии — только крещёных в Православии.</li>
          </ul>
          <p>Пожертвование за записку можно оставить в храме или перевести по реквизитам после отправки.</p>
        </aside>
      </div>
    </>
  )
}
