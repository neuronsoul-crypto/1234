import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const events = [
  { year: '1890', text: 'Закладка первого камня храма по указу Его Высочества. Проект выполнен в русско-византийском стиле.' },
  { year: '1898', text: 'Освящение храма во имя Архангела Михаила. Первое богослужение совершено 21 ноября.' },
  { year: '1920-е', text: 'Период испытаний. Храм закрыт советской властью, имущество изъято.' },
  { year: '1991', text: 'Возвращение храма верующим. Начало масштабной реставрации интерьеров и фресок.' },
  { year: 'Сегодня', text: 'Действующий приход. Ежедневные богослужения, воскресная школа и духовные беседы.' },
]

export default function History() {
  const sectionRef = useRef(null)
  const labelRef = useRef(null)
  const titleRef = useRef(null)
  const imgRef = useRef(null)
  const statsRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Label
      gsap.fromTo(labelRef.current,
        { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      )

      // Title chars
      const chars = titleRef.current.querySelectorAll('.hch')
      gsap.fromTo(chars,
        { y: '105%', opacity: 0 },
        {
          y: '0%', opacity: 1, duration: 1, stagger: 0.04, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      )

      // Image reveal clip-path
      gsap.fromTo(imgRef.current,
        { clipPath: 'inset(100% 0 0 0)', scale: 1.1 },
        {
          clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.4, ease: 'power3.out',
          scrollTrigger: { trigger: imgRef.current, start: 'top 80%' },
        }
      )

      // Parallax image inside
      gsap.to(imgRef.current.querySelector('.img-inner'), {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: imgRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Stats counter
      const stats = statsRef.current.querySelectorAll('.stat-num')
      stats.forEach(el => {
        const target = parseInt(el.dataset.target, 10)
        gsap.fromTo({ val: 0 }, { val: target }, {
          duration: 2,
          ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].val) },
          scrollTrigger: { trigger: statsRef.current, start: 'top 80%', once: true },
        })
      })

      // Timeline items
      const items = timelineRef.current.querySelectorAll('.tl-item')
      gsap.fromTo(items,
        { x: 60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: timelineRef.current, start: 'top 75%' },
        }
      )

      // Timeline line draw
      gsap.fromTo(timelineRef.current.querySelector('.tl-line'),
        { scaleY: 0 },
        {
          scaleY: 1, duration: 2, ease: 'power2.out',
          scrollTrigger: { trigger: timelineRef.current, start: 'top 75%' },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const title = 'История'

  return (
    <section ref={sectionRef} id="history" style={{
      padding: '140px 48px 140px',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Section label */}
      <p ref={labelRef} style={{
        fontFamily: 'var(--ff-sans)',
        fontSize: '0.65rem',
        letterSpacing: '0.4em',
        textTransform: 'uppercase',
        color: 'var(--gold)',
        marginBottom: '16px',
        opacity: 0,
      }}>
        01 — О храме
      </p>

      {/* Title */}
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
          <span key={i} className="hch" style={{ display: 'inline-block', opacity: 0 }}>{ch}</span>
        ))}
      </div>

      {/* Two columns: image + timeline */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '80px',
        alignItems: 'start',
        maxWidth: '1200px',
        marginBottom: '100px',
      }}>
        {/* Image */}
        <div ref={imgRef} style={{
          position: 'relative',
          height: '580px',
          overflow: 'hidden',
          borderRadius: '2px',
        }}>
          <div className="img-inner" style={{
            position: 'absolute',
            inset: '-10%',
            background: `
              linear-gradient(160deg, #2A1C0F 0%, #1A1208 40%, #3D2812 100%)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Decorative church illustration */}
            <svg width="280" height="380" viewBox="0 0 280 380" fill="none" opacity="0.7">
              {/* Base */}
              <rect x="60" y="260" width="160" height="120" fill="none" stroke="rgba(196,149,42,0.4)" strokeWidth="1" />
              {/* Nave */}
              <rect x="80" y="200" width="120" height="80" fill="none" stroke="rgba(196,149,42,0.5)" strokeWidth="1" />
              {/* Apse */}
              <path d="M140 200 Q180 180 200 200" fill="none" stroke="rgba(196,149,42,0.3)" strokeWidth="1" />
              {/* Main dome base */}
              <rect x="100" y="140" width="80" height="80" fill="none" stroke="rgba(196,149,42,0.6)" strokeWidth="1" />
              {/* Dome */}
              <ellipse cx="140" cy="140" rx="40" ry="20" fill="none" stroke="rgba(196,149,42,0.7)" strokeWidth="1" />
              <ellipse cx="140" cy="125" rx="30" ry="15" fill="none" stroke="rgba(196,149,42,0.6)" strokeWidth="1" />
              <ellipse cx="140" cy="112" rx="20" ry="10" fill="none" stroke="rgba(196,149,42,0.5)" strokeWidth="1" />
              {/* Lantern */}
              <rect x="133" y="85" width="14" height="30" fill="none" stroke="rgba(196,149,42,0.8)" strokeWidth="1" />
              {/* Cross */}
              <line x1="140" y1="50" x2="140" y2="85" stroke="rgba(196,149,42,0.9)" strokeWidth="1.2" />
              <line x1="128" y1="62" x2="152" y2="62" stroke="rgba(196,149,42,0.9)" strokeWidth="1.2" />
              <line x1="132" y1="72" x2="148" y2="72" stroke="rgba(196,149,42,0.7)" strokeWidth="0.8" />
              {/* Oblique cross beam */}
              <line x1="133" y1="78" x2="147" y2="82" stroke="rgba(196,149,42,0.6)" strokeWidth="0.8" />
              {/* Windows */}
              <rect x="105" y="220" width="20" height="30" rx="10" fill="none" stroke="rgba(196,149,42,0.4)" strokeWidth="0.8" />
              <rect x="155" y="220" width="20" height="30" rx="10" fill="none" stroke="rgba(196,149,42,0.4)" strokeWidth="0.8" />
              <rect x="130" y="215" width="20" height="35" rx="10" fill="none" stroke="rgba(196,149,42,0.5)" strokeWidth="0.8" />
              {/* Door */}
              <rect x="121" y="310" width="38" height="70" rx="19" fill="none" stroke="rgba(196,149,42,0.6)" strokeWidth="1" />
              {/* Horizontal lines on walls */}
              <line x1="60" y1="290" x2="220" y2="290" stroke="rgba(196,149,42,0.2)" strokeWidth="0.5" />
              <line x1="60" y1="320" x2="220" y2="320" stroke="rgba(196,149,42,0.2)" strokeWidth="0.5" />
              {/* Bell tower */}
              <rect x="185" y="220" width="35" height="160" fill="none" stroke="rgba(196,149,42,0.35)" strokeWidth="0.8" />
              <ellipse cx="202" cy="220" rx="17" ry="8" fill="none" stroke="rgba(196,149,42,0.4)" strokeWidth="0.8" />
              <line x1="202" y1="195" x2="202" y2="220" stroke="rgba(196,149,42,0.7)" strokeWidth="1" />
              <line x1="194" y1="204" x2="210" y2="204" stroke="rgba(196,149,42,0.7)" strokeWidth="0.8" />
            </svg>
          </div>
          {/* Overlay text */}
          <div style={{
            position: 'absolute',
            bottom: '32px',
            left: '32px',
            right: '32px',
          }}>
            <p style={{
              fontFamily: 'var(--ff-serif)',
              fontSize: '0.9rem',
              fontStyle: 'italic',
              color: 'rgba(221,185,106,0.8)',
              lineHeight: 1.6,
            }}>
              Храм Архангела Михаила — один из старейших православных приходов юго-западного Крыма
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} style={{ position: 'relative', paddingLeft: '32px' }}>
          {/* Vertical line */}
          <div className="tl-line" style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '1px',
            height: '100%',
            background: 'linear-gradient(to bottom, var(--gold), transparent)',
            transformOrigin: 'top',
          }} />

          {events.map((ev, i) => (
            <div key={i} className="tl-item" style={{
              position: 'relative',
              marginBottom: '48px',
              paddingLeft: '16px',
              opacity: 0,
            }}>
              {/* Dot */}
              <div style={{
                position: 'absolute',
                left: -36,
                top: 6,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--gold)',
                boxShadow: '0 0 12px rgba(196,149,42,0.5)',
              }} />
              <span style={{
                fontFamily: 'var(--ff-serif)',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--gold)',
                display: 'block',
                marginBottom: '8px',
              }}>
                {ev.year}
              </span>
              <p style={{
                fontFamily: 'var(--ff-sans)',
                fontSize: '0.85rem',
                lineHeight: 1.8,
                color: 'var(--muted)',
                fontWeight: 300,
              }}>
                {ev.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div ref={statsRef} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px',
        background: 'rgba(196,149,42,0.15)',
        border: '1px solid rgba(196,149,42,0.15)',
        maxWidth: '900px',
      }}>
        {[
          { target: 130, suffix: '+', label: 'Лет истории' },
          { target: 365, suffix: '', label: 'Дней в году' },
          { target: 12, suffix: '', label: 'Православных праздников' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '48px 40px',
            background: 'var(--bg)',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--ff-serif)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 300,
              color: 'var(--gold)',
              lineHeight: 1,
              marginBottom: '12px',
            }}>
              <span className="stat-num" data-target={s.target}>0</span>
              <span>{s.suffix}</span>
            </div>
            <p style={{
              fontFamily: 'var(--ff-sans)',
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              fontWeight: 400,
            }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
