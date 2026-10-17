import { CmsPage, cmsPageMeta } from '@/components/blocks/CmsPage'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 600

type Props = { params: Promise<{ pageSlug: string }> }

/** Остальные страницы из CMS: /prihod, /palomnikam, /politika и любые новые. */
export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const pages = await payload.find({ collection: 'pages', limit: 100, depth: 0, select: { slug: true } })
  return pages.docs.map((p) => ({ pageSlug: p.slug ?? '' }))
}

export async function generateMetadata({ params }: Props) {
  const { pageSlug } = await params
  return cmsPageMeta(pageSlug, 'Страница')
}

export default async function Page({ params }: Props) {
  const { pageSlug } = await params
  return <CmsPage slug={pageSlug} />
}
