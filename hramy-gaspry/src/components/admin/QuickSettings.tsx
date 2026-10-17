'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Banner = { enabled: boolean; text: string; until: string }
type Campaign = { enabled: boolean; title: string; goal: number; collected: number }

async function saveSettings(data: Record<string, unknown>) {
  const res = await fetch('/api/globals/settings', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json?.errors?.[0]?.message || 'Не удалось сохранить')
  }
}

export function QuickSettings({ banner: b0, campaign: c0 }: { banner: Banner; campaign: Campaign }) {
  const router = useRouter()
  const [banner, setBanner] = useState(b0)
  const [campaign, setCampaign] = useState(c0)
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()

  const save = (data: Record<string, unknown>, ok: string) =>
    start(async () => {
      try {
        await saveSettings(data)
        setMsg(ok)
        router.refresh()
      } catch (e) {
        setMsg((e as Error).message)
      }
    })

  const percent = campaign.goal ? Math.min(100, Math.round((campaign.collected / campaign.goal) * 100)) : 0

  return (
    <div className="hg-quick">
      <section className="hg-panel">
        <h2>Объявление на сайте</h2>
        <label className="hg-check">
          <input
            type="checkbox"
            checked={banner.enabled}
            onChange={(e) => setBanner({ ...banner, enabled: e.target.checked })}
          />{' '}
          Показывать полосу с объявлением
        </label>
        <label className="hg-field">
          Текст объявления
          <input
            value={banner.text}
            placeholder="Например: 19 октября Божественная литургия начнётся в 8:00"
            onChange={(e) => setBanner({ ...banner, text: e.target.value })}
          />
        </label>
        <label className="hg-field">
          Показывать до (необязательно)
          <input
            type="date"
            value={banner.until ? banner.until.slice(0, 10) : ''}
            onChange={(e) => setBanner({ ...banner, until: e.target.value ? `${e.target.value}T20:59:00.000Z` : '' })}
          />
        </label>
        <button
          type="button"
          className="btn btn--style-primary btn--size-medium"
          disabled={pending}
          onClick={() =>
            save(
              { banner: { ...banner, until: banner.until || null } },
              banner.enabled ? 'Объявление показано на сайте.' : 'Объявление скрыто.',
            )
          }
        >
          Сохранить объявление
        </button>
      </section>

      <section className="hg-panel">
        <h2>Сбор пожертвований</h2>
        <label className="hg-check">
          <input
            type="checkbox"
            checked={campaign.enabled}
            onChange={(e) => setCampaign({ ...campaign, enabled: e.target.checked })}
          />{' '}
          Показывать сбор на сайте
        </label>
        <label className="hg-field">
          На что собираем
          <input value={campaign.title} onChange={(e) => setCampaign({ ...campaign, title: e.target.value })} />
        </label>
        <div className="hg-row">
          <label className="hg-field">
            Нужно, ₽
            <input
              inputMode="numeric"
              value={campaign.goal || ''}
              onChange={(e) => setCampaign({ ...campaign, goal: Number(e.target.value.replace(/\D/g, '')) })}
            />
          </label>
          <label className="hg-field">
            Собрано, ₽
            <input
              inputMode="numeric"
              value={campaign.collected || ''}
              onChange={(e) => setCampaign({ ...campaign, collected: Number(e.target.value.replace(/\D/g, '')) })}
            />
          </label>
        </div>
        <div className="hg-progress" aria-label={`Собрано ${percent}%`}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <button
          type="button"
          className="btn btn--style-primary btn--size-medium"
          disabled={pending}
          onClick={() => save({ campaign }, 'Сбор обновлён.')}
        >
          Сохранить сбор
        </button>
      </section>
      {msg ? (
        <p className="hg-week__msg" role="status">
          {msg}
        </p>
      ) : null}
    </div>
  )
}
