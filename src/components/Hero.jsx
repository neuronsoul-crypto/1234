import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Hero() {
  const sectionRef = useRef(null)
  const bgRef = useRef(null)
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)
  const subtitleRef = useRef(null)
  const scrollRef = useRef(null)
  const crossRef = useRef(null)
  const particlesRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax background
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Entrance timeline
      const tl = gsap.timeline({ delay: 0.3 })

      // Cross draw
      tl.fromTo(crossRef.current.querySelectorAll('line, path'),
        { strokeDasharray: '200', strokeDashoffset: '200', opacity: 0 },
        { strokeDashoffset: '0', opacity: 1, duration: 1.8, stagger: 0.12, ease: 'power2.out' }
      )

      // Line 1 chars
      const chars1 = line1Ref.current.querySelectorAll('.ch')
      tl.fromTo(chars1,
        { y: '110%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.9, stagger: 0.03, ease: 'power3.out' },
        '-=0.8'
      )

      // Line 2 chars
      const chars2 = line2Ref.current.querySelectorAll('.ch')
      tl.fromTo(chars2,
        { y: '110%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.9, stagger: 0.03, ease: 'power3.out' },
        '-=0.7'
      )

      // Subtitle
      tl.fromTo(subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out' },
        '-=0.4'
      )

      // Scroll indicator
      tl.fromTo(scrollRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.2'
      )

      // Scroll indicator bounce
      gsap.to(scrollRef.current.querySelector('.scroll-line'), {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 1.2,
        repeat: -1,
        ease: 'power2.inOut',
      })

      // Parallax cross on scroll
      gsap.to(crossRef.current, {
        y: -80,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '40% top',
          scrub: true,
        },
      })

      // Fade out text on scroll
      gsap.to([line1Ref.current, line2Ref.current, subtitleRef.current], {
        y: -60,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '35% top',
          scrub: true,
        },
      })

      // Animate particles
      const particles = particlesRef.current.querySelectorAll('.particle')
      particles.forEach((p, i) => {
        gsap.to(p, {
          y: `random(-40, 40)`,
          x: `random(-20, 20)`,
          opacity: `random(0.3, 0.8)`,
          duration: `random(3, 6)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const splitLine = text =>
    [...text].map((ch, i) => (
      <span key={i} className="ch" style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
        {ch === ' ' ? ' ' : ch}
      </span>
    ))

  return (
    <section ref={sectionRef} id="hero" style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      minHeight: 700,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Background */}
      <div ref={bgRef} style={{
        position: 'absolute',
        inset: '-20%',
        background: `
          radial-gradient(ellipse 80% 60% at 50% 30%, rgba(196,149,42,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 60% 80% at 80% 70%, rgba(184,115,51,0.12) 0%, transparent 60%),
          linear-gradient(160deg, #0C0805 0%, #1A120A 40%, #2A1C0F 70%, #120D06 100%)
        `,
        zIndex: 0,
      }} />

      {/* Particles */}
      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="particle" style={{
            position: 'absolute',
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            borderRadius: '50%',
            background: `rgba(196, 149, 42, ${0.2 + Math.random() * 0.5})`,
            opacity: 0.4,
          }} />
        ))}
      </div>

      {/* Decorative arch lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="720" cy="450" rx="340" ry="420" fill="none" stroke="rgba(196,149,42,0.08)" strokeWidth="1" />
        <ellipse cx="720" cy="450" rx="260" ry="320" fill="none" stroke="rgba(196,149,42,0.06)" strokeWidth="1" />
        <line x1="0" y1="0" x2="1440" y2="900" stroke="rgba(196,149,42,0.04)" strokeWidth="1" />
        <line x1="1440" y1="0" x2="0" y2="900" stroke="rgba(196,149,42,0.04)" strokeWidth="1" />
      </svg>

      {/* Decorative Cross */}
      <div ref={crossRef} style={{ position: 'absolute', top: '14%', zIndex: 2 }}>
        <svg width="60" height="110" viewBox="0 0 60 110" fill="none">
          <line x1="30" y1="0" x2="30" y2="110" stroke="#C4952A" strokeWidth="1.2" />
          <line x1="8" y1="28" x2="52" y2="28" stroke="#C4952A" strokeWidth="1.2" />
          <line x1="14" y1="44" x2="46" y2="44" stroke="#C4952A" strokeWidth="0.8" />
          <line x1="16" y1="90" x2="44" y2="100" stroke="#C4952A" strokeWidth="0.8" />
          <circle cx="30" cy="28" r="3" fill="none" stroke="#DDB96A" strokeWidth="0.8" />
          <path d="M22 22 Q30 16 38 22" fill="none" stroke="#DDB96A" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        padding: '0 24px',
        maxWidth: '960px',
        marginTop: '60px',
      }}>
        {/* City */}
        <p style={{
          fontFamily: 'var(--ff-sans)',
          fontSize: '0.7rem',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'var(--gold-light)',
          marginBottom: '32px',
          fontWeight: 300,
        }}>
          Алупка · Крым · 1890
        </p>

        {/* Line 1 */}
        <div ref={line1Ref} style={{
          fontFamily: 'var(--ff-serif)',
          fontSize: 'clamp(3rem, 8vw, 7.5rem)',
          fontWeight: 300,
          lineHeight: 0.9,
          color: 'var(--white)',
          letterSpacing: '-0.01em',
          marginBottom: '0.1em',
          display: 'block',
        }}>
          {splitLine('АРХАНГЕЛ')}
        </div>

        {/* Line 2 — italic gold */}
        <div ref={line2Ref} style={{
          fontFamily: 'var(--ff-serif)',
          fontSize: 'clamp(3rem, 8vw, 7.5rem)',
          fontWeight: 300,
          fontStyle: 'italic',
          lineHeight: 0.9,
          color: 'var(--gold-light)',
          letterSpacing: '-0.01em',
          marginBottom: '2rem',
          display: 'block',
        }}>
          {splitLine('Михаил')}
        </div>

        {/* Subtitle */}
        <p ref={subtitleRef} style={{
          fontFamily: 'var(--ff-sans)',
          fontSize: '0.78rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'rgba(253,250,243,0.55)',
          fontWeight: 300,
          opacity: 0,
        }}>
          Православный храм на берегу Чёрного моря
        </p>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        opacity: 0,
      }}>
        <span style={{
          fontFamily: 'var(--ff-sans)',
          fontSize: '0.6rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(196,149,42,0.6)',
        }}>Прокрутите</span>
        <div style={{ width: 1, height: 50, background: 'rgba(196,149,42,0.3)', overflow: 'hidden' }}>
          <div className="scroll-line" style={{
            width: '100%',
            height: '100%',
            background: 'var(--gold)',
            transformOrigin: 'top',
          }} />
        </div>
      </div>

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(to bottom, transparent, var(--bg))',
        zIndex: 3,
        pointerEvents: 'none',
      }} />
    </section>
  )
}
