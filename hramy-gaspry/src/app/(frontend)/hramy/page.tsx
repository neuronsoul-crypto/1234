import { ChurchCard } from '@/components/ui/Cards'
import { MapBlock } from '@/components/ui/MapBlock'
import { PageHeader } from '@/components/ui/PageHeader'
import { getChurches } from '@/lib/data'
import { pageMeta } from '@/lib/seo'

export const revalidate = 600

export const metadata = pageMeta({
  title: 'Наши храмы',
  description: 'Храм святой равноапостольной Нины (1908) и церковь иконы Божией Матери «Нерушимая Стена» в Гаспре.',
  path: '/hramy',
})

export default async function ChurchesPage() {
  const churches = await getChurches()
  return (
    <>
      <PageHeader
        path="/храмы"
        title="Наши храмы"
        lead="Два храма одного прихода стоят рядом в Гаспре: старинный храм святой Нины при усадьбе Харакс и церковь иконы Божией Матери «Нерушимая Стена»."
        crumbs={[{ label: 'Храмы' }]}
      />
      <div className="container-site grid gap-16 md:grid-cols-2 md:gap-12">
        {churches.map((c, i) => (
          <ChurchCard key={c.id} church={c} priority={i === 0} />
        ))}
      </div>
      <section className="section mt-24">
        <div className="container-site">
          <h2 className="mb-10 text-h2">На карте</h2>
          <MapBlock
            apiKey={process.env.YANDEX_MAPS_KEY}
            churches={churches.map((c) => ({
              id: c.id,
              name: c.name,
              shortName: c.shortName,
              address: c.address,
              color: c.color,
              lat: c.lat,
              lng: c.lng,
              orgId: c.yandexOrgId,
            }))}
          />
        </div>
      </section>
    </>
  )
}
