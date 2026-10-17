import { draftMode, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'

/** Вход в режим предпросмотра черновиков — только для вошедших в админку. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type')
  const slug = (url.searchParams.get('slug') ?? '').replace(/[^a-z0-9-]/g, '')
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return new Response('Войдите в админку, чтобы смотреть черновики', { status: 403 })
  ;(await draftMode()).enable()
  if (!slug) redirect('/')
  redirect(type === 'posts' ? `/novosti/${slug}` : `/${slug}`)
}
