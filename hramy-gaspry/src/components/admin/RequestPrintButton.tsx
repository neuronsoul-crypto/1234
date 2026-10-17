'use client'
import { useDocumentInfo } from '@payloadcms/ui'

export function RequestPrintButton() {
  const { id } = useDocumentInfo()
  if (!id) return null
  return (
    <div className="hg-print-bar">
      <a className="btn btn--style-secondary btn--size-small" href={`/pechat/zapiski?id=${id}`} target="_blank" rel="noopener">
        Распечатать эту заявку
      </a>
    </div>
  )
}
