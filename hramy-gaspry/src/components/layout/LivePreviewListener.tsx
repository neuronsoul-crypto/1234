'use client'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

import { SITE_URL } from '@/lib/site'

/** Предпросмотр в админке: страница обновляется при каждом сохранении черновика. */
export function LivePreviewListener() {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={SITE_URL} />
}
