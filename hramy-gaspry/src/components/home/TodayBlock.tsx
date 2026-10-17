import { dayInfo } from '@/lib/church-calendar'
import { formatDayMonth, formatLongDate, storedToKey, WEEKDAYS, weekdayOf } from '@/lib/dates'
import type { Setting } from '@/payload-types'

import { FeastBadge } from '../ui/FeastBadge'
import { PathLabel } from '../ui/PathLabel'

/** «Сегодня»: дата по новому и старому стилю, седмица, пост, праздник, память святых. */
export function TodayBlock({ today, settings }: { today: string; settings: Setting }) {
  const info = dayInfo(today)
  const saints =
    settings.calendar?.saints && storedToKey(settings.calendar.saintsDate) === today ? settings.calendar.saints : ''
  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
      <div>
        <PathLabel>/сегодня</PathLabel>
        <p className="mt-4 font-display text-display leading-none">{formatDayMonth(today)}</p>
        <p className="mt-3 text-[1.25rem] capitalize text-ink-2">
          {WEEKDAYS[weekdayOf(today)]}
          <span className="normal-case"> · {formatLongDate(info.julian)} по ст. ст.</span>
        </p>
      </div>
      <div className="space-y-5 md:pt-10">
        {info.feast ? (
          <div className="space-y-2">
            <FeastBadge rank={info.feast.rank} />
            <p className={`font-display text-h2 ${info.feast.rank === 'great' ? 'text-gold-ink' : 'text-feast'}`}>{info.feast.title}</p>
          </div>
        ) : null}
        <p className="text-[1.25rem]">{info.week}</p>
        {info.fasting ? <p className="text-ink-2">{info.fasting}</p> : null}
        {saints ? <p className="whitespace-pre-line text-ink-2 measure">{saints}</p> : null}
      </div>
    </div>
  )
}
