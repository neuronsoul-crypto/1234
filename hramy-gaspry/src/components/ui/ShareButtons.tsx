'use client'
import { Link2, Send } from 'lucide-react'
import { useState } from 'react'

import { Toast } from './Toast'

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const enc = encodeURIComponent
  const item = 'tap inline-flex items-center gap-2 rounded-btn border border-line px-3 text-small hover:border-ink'
  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <span className="mr-2 text-small text-ink-2">Поделиться:</span>
      <a className={item} href={`https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`} target="_blank" rel="noopener noreferrer">
        <Send size={16} strokeWidth={1.5} aria-hidden /> Telegram
      </a>
      <a className={item} href={`https://vk.com/share.php?url=${enc(url)}&title=${enc(title)}`} target="_blank" rel="noopener noreferrer">
        <span aria-hidden className="font-semibold">VK</span> ВКонтакте
      </a>
      <button
        type="button"
        className={item}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
          } catch {
            window.prompt('Скопируйте ссылку', url)
          }
        }}
      >
        <Link2 size={16} strokeWidth={1.5} aria-hidden /> Копировать ссылку
      </button>
      {copied ? <Toast message="Ссылка скопирована" onClose={() => setCopied(false)} /> : null}
    </div>
  )
}
