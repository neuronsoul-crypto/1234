import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const photos = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1548625361-3193b06f4aac?w=800&q=80',
    label: 'Алтарь',
    span: 'tall',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1607277013598-b10843756ab1?w=800&q=80',
    label: 'Иконостас',
    span: 'normal',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    label: 'Крым · Рассвет',
    span: 'normal',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    label: 'Свечи',
    span: 'wide',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80',
    label: 'Побережье Алупки',
    span: 'normal',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    label: 'Горы Крыма',
    span: 'tall',
  },
]

export default function Gallery() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const titleRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title
      const chars = titleRef.current.querySelectorAll('.gch')
      gsap.fromTo(chars,
        { y: '100%', opacity: 0 },
        {
          y: '0%', opacity: 1, duration: 1, stagger: 0.04, ease: 'power3.out',
          scrollTrigger: { trigger: titleRef.current, start: 'top 80%' },
        }
      )

      // Horizontal scroll
      const track = trackRef.current
      const totalWidth = track.scrollWidth - window.innerWidth + 96

      const tween = gsap.to(track, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${totalWidth}`,
          onUpdate: self => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`
            }
          },
        },
      })

      // Individual card reveals
      const cards = track.querySelectorAll('.gallery-card')
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `${i * 15}% top`,
              containerAnimation: tween,
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      // Hover effects
      cards.forEach(card => {
        const overlay = card.querySelector('.card-overlay')
        const label = card.querySelector('.card-label')
        card.addEventListener('mouseenter', () => {
          gsap.to(overlay, { opacity: 1, duration: 0.4 })
          gsap.to(label, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' })
          gsap.to(card.querySelector('.card-img'), { scale: 1.05, duration: 0.6, ease: 'power2.out' })
        })
        card.addEventListener('mouseleave', () => {
          gsap.to(overlay, { opacity: 0, duration: 0.4 })
          gsap.to(label, { y: 16, opacity: 0, duration: 0.3 })
          gsap.to(card.querySelector('.card-img'), { scale: 1, duration: 0.6, ease: 'power2.out' })
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const title = 'Галерея'

  return (
    <section ref={sectionRef} id="gallery" style={{
      background: 'var(--bg)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ padding: '140px 48px 60px' }}>
        <p style={{
          fontFamily: 'var(--ff-sans)',
          fontSize: '0.65rem',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: '16px',
        }}>
          03 — Жизнь прихода
        </p>

        <div ref={titleRef} style={{
          fontFamily: 'var(--ff-serif)',
          fontSize: 'clamp(3.5rem, 9vw, 8rem)',
          fontWeight: 300,
          lineHeight: 0.9,
          color: 'var(--text)',
          overflow: 'hidden',
        }}>
          {[...title].map((ch, i) => (
            <span key={i} className="gch" style={{ display: 'inline-block', opacity: 0 }}>{ch}</span>
          ))}
        </div>

        {/* Progress */}
        <div style={{
          width: '120px',
          height: '1px',
          background: 'rgba(196,149,42,0.2)',
          marginTop: '40px',
          overflow: 'hidden',
        }}>
          <div ref={progressRef} style={{
            width: '100%',
            height: '100%',
            background: 'var(--gold)',
            transformOrigin: 'left center',
            transform: 'scaleX(0)',
          }} />
        </div>
      </div>

      {/* Horizontal track */}
      <div ref={trackRef} style={{
        display: 'flex',
        gap: '20px',
        paddingLeft: '48px',
        paddingRight: '48px',
        paddingBottom: '80px',
        willChange: 'transform',
      }}>
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="gallery-card"
            style={{
              position: 'relative',
              flexShrink: 0,
              width: photo.span === 'wide' ? '680px' : photo.span === 'tall' ? '400px' : '360px',
              height: photo.span === 'tall' ? '560px' : '440px',
              borderRadius: '2px',
              overflow: 'hidden',
              cursor: 'none',
              opacity: 0,
            }}
            data-cursor
          >
            {/* Image */}
            <div className="card-img" style={{
              position: 'absolute',
              inset: 0,
              background: `
                linear-gradient(135deg,
                  hsl(${30 + photo.id * 15}, 30%, ${15 + photo.id * 5}%) 0%,
                  hsl(${20 + photo.id * 10}, 40%, 20%) 100%
                )`,
              backgroundImage: `url(${photo.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
              {/* Fallback gradient if image doesn't load */}
            </div>

            {/* Overlay */}
            <div className="card-overlay" style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15,10,3,0.85) 0%, rgba(15,10,3,0.1) 50%, transparent 100%)',
              opacity: 0,
            }} />

            {/* Label */}
            <div className="card-label" style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              right: '24px',
              opacity: 0,
              transform: 'translateY(16px)',
            }}>
              <p style={{
                fontFamily: 'var(--ff-serif)',
                fontSize: '1.2rem',
                fontStyle: 'italic',
                color: 'var(--white)',
              }}>
                {photo.label}
              </p>
            </div>

            {/* Corner accent */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '20px',
              height: '20px',
              borderTop: '1px solid rgba(196,149,42,0.5)',
              borderRight: '1px solid rgba(196,149,42,0.5)',
            }} />
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <p style={{
        textAlign: 'center',
        fontFamily: 'var(--ff-sans)',
        fontSize: '0.65rem',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        paddingBottom: '40px',
      }}>
        Прокрутите для просмотра →
      </p>
    </section>
  )
}
