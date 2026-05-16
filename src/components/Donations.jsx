import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Donations() {
  const sectionRef = useRef(null)
  const bgRef = useRef(null)
  const titleRef = useRef(null)
  const textRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background parallax
      gsap.to(bgRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Title reveal
      const chars = titleRef.current.querySelectorAll('.dch')
      gsap.fromTo(chars,
        { y: '100%', opacity: 0 },
        {
          y: '0%', opacity: 1, duration: 1, stagger: 0.04, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      )

      gsap.fromTo(textRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        }
      )

      gsap.fromTo(btnRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, delay: 0.2, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        }
      )

      // Shimmer animation on the gradient
      gsap.to(bgRef.current, {
        backgroundPosition: '200% 50%',
        duration: 8,
        repeat: -1,
        ease: 'none',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const title = 'Помочь\nхраму'

  const handleHover = enter => {
    const btn = btnRef.current
    if (enter) {
      gsap.to(btn, { scale: 1.04, duration: 0.3, ease: 'power2.out' })
      gsap.to(btn.querySelector('.btn-fill'), { scaleX: 1, duration: 0.4, ease: 'power3.out' })
      gsap.to(btn.querySelector('.btn-text'), { color: '#0F0A03', duration: 0.3 })
    } else {
      gsap.to(btn, { scale: 1, duration: 0.3, ease: 'power2.out' })
      gsap.to(btn.querySelector('.btn-fill'), { scaleX: 0, duration: 0.4, ease: 'power3.in' })
      gsap.to(btn.querySelector('.btn-text'), { color: '#C4952A', duration: 0.3 })
    }
  }

  return (
    <section ref={sectionRef} id="donations" style={{
      position: 'relative',
      padding: '180px 48px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
    }}>
      {/* Background */}
      <div ref={bgRef} style={{
        position: 'absolute',
        inset: '-20%',
        background: `
          radial-gradient(ellipse 100% 80% at 20% 50%, rgba(196,149,42,0.22) 0%, transparent 60%),
          radial-gradient(ellipse 80% 100% at 80% 50%, rgba(184,115,51,0.15) 0%, transparent 60%),
          linear-gradient(135deg, #0F0A03 0%, #1E1408 40%, #2A1C0F 70%, #0F0A03 100%)
        `,
        backgroundSize: '300% 100%',
        zIndex: 0,
      }} />

      {/* Decorative SVG */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, opacity: 0.15 }} viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="720" cy="400" rx="500" ry="380" fill="none" stroke="rgba(196,149,42,1)" strokeWidth="0.5" />
        <ellipse cx="720" cy="400" rx="380" ry="280" fill="none" stroke="rgba(196,149,42,1)" strokeWidth="0.5" />
        <line x1="720" y1="20" x2="720" y2="780" stroke="rgba(196,149,42,1)" strokeWidth="0.5" />
        <line x1="220" y1="400" x2="1220" y2="400" stroke="rgba(196,149,42,1)" strokeWidth="0.5" />
      </svg>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '700px' }}>
        {/* Label */}
        <p style={{
          fontFamily: 'var(--ff-sans)',
          fontSize: '0.65rem',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'rgba(196,149,42,0.6)',
          marginBottom: '40px',
        }}>
          04 — Пожертвования
        </p>

        {/* Icon */}
        <div style={{ marginBottom: '40px' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 8 C24 8 10 16 10 28 C10 35 16 40 24 40 C32 40 38 35 38 28 C38 16 24 8 24 8Z" fill="none" stroke="rgba(196,149,42,0.6)" strokeWidth="1" />
            <path d="M24 14 C24 14 16 20 16 28 C16 32 19.6 35 24 35 C28.4 35 32 32 32 28 C32 20 24 14 24 14Z" fill="none" stroke="rgba(196,149,42,0.8)" strokeWidth="1" />
            <circle cx="24" cy="28" r="4" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
            <line x1="24" y1="2" x2="24" y2="8" stroke="var(--gold)" strokeWidth="1.2" />
            <line x1="18" y1="4" x2="24" y2="8" stroke="rgba(196,149,42,0.5)" strokeWidth="0.8" />
            <line x1="30" y1="4" x2="24" y2="8" stroke="rgba(196,149,42,0.5)" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Title */}
        <div ref={titleRef} style={{
          fontFamily: 'var(--ff-serif)',
          fontSize: 'clamp(3rem, 8vw, 7rem)',
          fontWeight: 300,
          lineHeight: 1,
          color: 'var(--white)',
          marginBottom: '40px',
          overflow: 'hidden',
        }}>
          {[
            { word: 'Помочь', italic: false },
            { word: 'храму', italic: true },
          ].map(({ word, italic }, wi) => (
            <span key={wi} style={{ display: 'block', overflow: 'hidden' }}>
              {[...word].map((ch, i) => (
                <span key={i} className="dch" style={{
                  display: 'inline-block',
                  opacity: 0,
                  fontStyle: italic ? 'italic' : 'normal',
                  color: italic ? 'var(--gold-light)' : 'var(--white)',
                }}>
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </div>

        {/* Text */}
        <p ref={textRef} style={{
          fontFamily: 'var(--ff-sans)',
          fontSize: '0.9rem',
          lineHeight: 2,
          color: 'rgba(253,250,243,0.55)',
          fontWeight: 300,
          maxWidth: '480px',
          margin: '0 auto 56px',
          opacity: 0,
        }}>
          Ваша помощь позволяет сохранять древние фрески, содержать храм и развивать духовную жизнь прихода.
          Каждый вклад — это участие в благом деле.
        </p>

        {/* CTA Button */}
        <div ref={btnRef} style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', opacity: 0 }}>
          <button
            style={{
              position: 'relative',
              padding: '20px 52px',
              border: '1px solid var(--gold)',
              background: 'transparent',
              overflow: 'hidden',
              cursor: 'none',
              fontFamily: 'var(--ff-sans)',
            }}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
            data-cursor
          >
            <div className="btn-fill" style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--gold)',
              transformOrigin: 'left',
              transform: 'scaleX(0)',
            }} />
            <span className="btn-text" style={{
              position: 'relative',
              fontFamily: 'var(--ff-sans)',
              fontSize: '0.72rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              fontWeight: 400,
            }}>
              Пожертвовать
            </span>
          </button>

          <button
            style={{
              padding: '20px 40px',
              border: '1px solid rgba(253,250,243,0.15)',
              background: 'transparent',
              cursor: 'none',
              fontFamily: 'var(--ff-sans)',
              fontSize: '0.72rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(253,250,243,0.4)',
              fontWeight: 300,
              transition: 'border-color 0.3s, color 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(253,250,243,0.4)'
              e.currentTarget.style.color = 'rgba(253,250,243,0.8)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(253,250,243,0.15)'
              e.currentTarget.style.color = 'rgba(253,250,243,0.4)'
            }}
            data-cursor
          >
            Узнать подробнее
          </button>
        </div>

        {/* Divider */}
        <div style={{
          marginTop: '80px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(196,149,42,0.15)' }} />
          <p style={{
            fontFamily: 'var(--ff-sans)',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(196,149,42,0.4)',
            whiteSpace: 'nowrap',
          }}>
            Каждая молитва и лепта угодны Богу
          </p>
          <div style={{ flex: 1, height: '1px', background: 'rgba(196,149,42,0.15)' }} />
        </div>
      </div>
    </section>
  )
}
