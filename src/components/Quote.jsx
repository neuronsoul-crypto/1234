import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Quote() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)
  const lineLeftRef = useRef(null)
  const lineRightRef = useRef(null)
  const sourceRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Lines animate in from center
      gsap.fromTo([lineLeftRef.current, lineRightRef.current],
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.4,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Words animate up
      const words = textRef.current.querySelectorAll('.w')
      gsap.fromTo(words,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.04,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      gsap.fromTo(sourceRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const quote = 'Ибо где двое или трое собраны во имя Моё, там Я посреди них'
  const words = quote.split(' ')

  return (
    <section ref={sectionRef} style={{
      padding: '140px 48px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background ornament */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,149,42,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '48px', width: '100%', maxWidth: '700px' }}>
        <div ref={lineLeftRef} style={{
          flex: 1,
          height: '1px',
          background: 'linear-gradient(to left, var(--gold), transparent)',
          transformOrigin: 'right center',
        }} />
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 1 L11.8 7.6 L18.5 7.6 L13.1 11.6 L15 18.2 L10 14.2 L5 18.2 L6.9 11.6 L1.5 7.6 L8.2 7.6 Z" fill="var(--gold)" opacity="0.6" />
        </svg>
        <div ref={lineRightRef} style={{
          flex: 1,
          height: '1px',
          background: 'linear-gradient(to right, var(--gold), transparent)',
          transformOrigin: 'left center',
        }} />
      </div>

      <p ref={textRef} style={{
        fontFamily: 'var(--ff-serif)',
        fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
        fontWeight: 300,
        fontStyle: 'italic',
        lineHeight: 1.4,
        color: 'var(--text)',
        textAlign: 'center',
        maxWidth: '780px',
        letterSpacing: '0.01em',
      }}>
        {words.map((w, i) => (
          <span key={i} className="w" style={{ display: 'inline-block', marginRight: '0.28em', opacity: 0 }}>
            {w}
          </span>
        ))}
      </p>

      <p ref={sourceRef} style={{
        fontFamily: 'var(--ff-sans)',
        fontSize: '0.68rem',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'var(--gold)',
        marginTop: '40px',
        opacity: 0,
      }}>
        Евангелие от Матфея · 18:20
      </p>
    </section>
  )
}
