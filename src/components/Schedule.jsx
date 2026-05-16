import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const schedule = [
  {
    group: 'Будние дни',
    services: [
      { time: '08:00', name: 'Утреня. Часы. Литургия', note: '' },
      { time: '17:00', name: 'Вечерня. Утреня (накануне)' , note: '' },
    ],
  },
  {
    group: 'Суббота',
    services: [
      { time: '08:00', name: 'Ранняя Литургия', note: 'Панихида после службы' },
      { time: '10:00', name: 'Поздняя Литургия', note: '' },
      { time: '17:00', name: 'Всенощное бдение', note: '' },
    ],
  },
  {
    group: 'Воскресенье',
    services: [
      { time: '07:00', name: 'Ранняя Литургия', note: 'Исповедь с 06:30' },
      { time: '10:00', name: 'Поздняя Литургия', note: 'Молебен после службы' },
      { time: '17:00', name: 'Акафист Архангелу Михаилу', note: 'Каждое воскресенье' },
    ],
  },
  {
    group: 'Великие праздники',
    services: [
      { time: '18:00', name: 'Всенощное бдение (накануне)', note: '' },
      { time: '07:00', name: 'Ранняя Праздничная Литургия', note: '' },
      { time: '10:00', name: 'Поздняя Праздничная Литургия', note: '' },
    ],
  },
]

export default function Schedule() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title
      const chars = titleRef.current.querySelectorAll('.sch')
      gsap.fromTo(chars,
        { y: '100%', opacity: 0 },
        {
          y: '0%', opacity: 1, duration: 1, stagger: 0.03, ease: 'power3.out',
          scrollTrigger: { trigger: titleRef.current, start: 'top 80%' },
        }
      )

      // Group headers
      const groups = sectionRef.current.querySelectorAll('.sched-group')
      gsap.fromTo(groups,
        { x: -40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.7, stagger: 0.2, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      )

      // Rows
      const rows = sectionRef.current.querySelectorAll('.sched-row')
      gsap.fromTo(rows,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      )

      // Hover lines
      rows.forEach(row => {
        const line = row.querySelector('.row-line')
        row.addEventListener('mouseenter', () => {
          gsap.to(line, { scaleX: 1, duration: 0.4, ease: 'power2.out' })
          gsap.to(row, { backgroundColor: 'rgba(196,149,42,0.04)', duration: 0.3 })
        })
        row.addEventListener('mouseleave', () => {
          gsap.to(line, { scaleX: 0, duration: 0.4, ease: 'power2.in' })
          gsap.to(row, { backgroundColor: 'transparent', duration: 0.3 })
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const title = 'Расписание'

  return (
    <section ref={sectionRef} id="schedule" style={{
      padding: '140px 48px',
      background: 'var(--bg-dark)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Bg ornament */}
      <div style={{
        position: 'absolute',
        right: '-100px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        border: '1px solid rgba(196,149,42,0.06)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        right: '-60px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        border: '1px solid rgba(196,149,42,0.08)',
        pointerEvents: 'none',
      }} />

      <p style={{
        fontFamily: 'var(--ff-sans)',
        fontSize: '0.65rem',
        letterSpacing: '0.4em',
        textTransform: 'uppercase',
        color: 'var(--gold)',
        marginBottom: '16px',
      }}>
        02 — Богослужения
      </p>

      <div ref={titleRef} style={{
        fontFamily: 'var(--ff-serif)',
        fontSize: 'clamp(3.5rem, 9vw, 8rem)',
        fontWeight: 300,
        lineHeight: 0.9,
        color: 'var(--text)',
        marginBottom: '80px',
        overflow: 'hidden',
      }}>
        {[...title].map((ch, i) => (
          <span key={i} className="sch" style={{ display: 'inline-block', opacity: 0 }}>{ch}</span>
        ))}
      </div>

      <div style={{ maxWidth: '900px' }}>
        {schedule.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '60px' }}>
            <div className="sched-group" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '24px',
              opacity: 0,
            }}>
              <span style={{
                fontFamily: 'var(--ff-serif)',
                fontSize: '1.4rem',
                fontStyle: 'italic',
                color: 'var(--gold)',
                fontWeight: 400,
              }}>
                {group.group}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(196,149,42,0.2)' }} />
            </div>

            {group.services.map((svc, si) => (
              <div key={si} className="sched-row" style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '100px 1fr auto',
                gap: '32px',
                alignItems: 'center',
                padding: '20px 16px',
                borderBottom: '1px solid rgba(196,149,42,0.1)',
                transition: 'background 0.3s',
                opacity: 0,
              }}>
                <div className="row-line" style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  width: '100%',
                  height: '1px',
                  background: 'var(--gold)',
                  transformOrigin: 'left',
                  transform: 'scaleX(0)',
                }} />
                <span style={{
                  fontFamily: 'var(--ff-serif)',
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  color: 'var(--gold)',
                  letterSpacing: '0.05em',
                }}>
                  {svc.time}
                </span>
                <span style={{
                  fontFamily: 'var(--ff-sans)',
                  fontSize: '0.88rem',
                  color: 'var(--text)',
                  fontWeight: 300,
                  letterSpacing: '0.02em',
                }}>
                  {svc.name}
                </span>
                {svc.note && (
                  <span style={{
                    fontFamily: 'var(--ff-sans)',
                    fontSize: '0.65rem',
                    color: 'var(--muted)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    {svc.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Note */}
        <div style={{
          marginTop: '48px',
          padding: '24px 32px',
          border: '1px solid rgba(196,149,42,0.2)',
          background: 'rgba(196,149,42,0.03)',
        }}>
          <p style={{
            fontFamily: 'var(--ff-sans)',
            fontSize: '0.8rem',
            color: 'var(--muted)',
            lineHeight: 1.8,
            fontWeight: 300,
          }}>
            <strong style={{ color: 'var(--gold)', fontWeight: 500 }}>Исповедь</strong> — за 30 минут до начала Литургии.
            По вопросам крещения, венчания и других треб обращайтесь в храм по телефону или лично.
          </p>
        </div>
      </div>
    </section>
  )
}
