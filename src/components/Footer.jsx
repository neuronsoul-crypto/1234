import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Footer() {
  const footerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(footerRef.current.querySelectorAll('.f-col'),
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 85%' },
        }
      )
    }, footerRef)
    return () => ctx.revert()
  }, [])

  return (
    <footer ref={footerRef} style={{
      background: 'var(--bg)',
      borderTop: '1px solid rgba(196,149,42,0.15)',
      padding: '80px 48px 40px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '48px',
        maxWidth: '1200px',
        marginBottom: '64px',
      }}>
        {/* Logo col */}
        <div className="f-col" style={{ opacity: 0 }}>
          <div style={{ marginBottom: '20px' }}>
            <svg width="36" height="66" viewBox="0 0 36 66" fill="none">
              <line x1="18" y1="0" x2="18" y2="66" stroke="var(--gold)" strokeWidth="1" />
              <line x1="4" y1="18" x2="32" y2="18" stroke="var(--gold)" strokeWidth="1" />
              <line x1="8" y1="28" x2="28" y2="28" stroke="var(--gold)" strokeWidth="0.7" />
              <line x1="10" y1="54" x2="26" y2="60" stroke="var(--gold)" strokeWidth="0.7" />
            </svg>
          </div>
          <p style={{
            fontFamily: 'var(--ff-serif)',
            fontSize: '1.1rem',
            fontWeight: 500,
            color: 'var(--text)',
            letterSpacing: '0.03em',
            lineHeight: 1.3,
          }}>
            Храм<br />Архангела Михаила
          </p>
          <p style={{
            fontFamily: 'var(--ff-sans)',
            fontSize: '0.72rem',
            color: 'var(--muted)',
            marginTop: '8px',
            letterSpacing: '0.05em',
          }}>
            Алупка · Крым
          </p>
        </div>

        {/* Address */}
        <div className="f-col" style={{ opacity: 0 }}>
          <h4 style={{
            fontFamily: 'var(--ff-sans)',
            fontSize: '0.62rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '20px',
          }}>
            Адрес
          </h4>
          <address style={{ fontStyle: 'normal' }}>
            <p style={{
              fontFamily: 'var(--ff-sans)',
              fontSize: '0.82rem',
              color: 'var(--muted)',
              lineHeight: 1.8,
              fontWeight: 300,
            }}>
              Республика Крым,<br />
              г. Алупка,<br />
              ул. Советская, д. 12<br />
              298671
            </p>
          </address>
        </div>

        {/* Contacts */}
        <div className="f-col" style={{ opacity: 0 }}>
          <h4 style={{
            fontFamily: 'var(--ff-sans)',
            fontSize: '0.62rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '20px',
          }}>
            Контакты
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Телефон', val: '+7 (365) 270-XX-XX' },
              { label: 'Email', val: 'alupka.church@mail.ru' },
            ].map(item => (
              <div key={item.label}>
                <p style={{
                  fontFamily: 'var(--ff-sans)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  opacity: 0.7,
                  marginBottom: '2px',
                }}>
                  {item.label}
                </p>
                <p style={{
                  fontFamily: 'var(--ff-sans)',
                  fontSize: '0.82rem',
                  color: 'var(--muted)',
                  fontWeight: 300,
                }}>
                  {item.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule quick */}
        <div className="f-col" style={{ opacity: 0 }}>
          <h4 style={{
            fontFamily: 'var(--ff-sans)',
            fontSize: '0.62rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '20px',
          }}>
            Службы
          </h4>
          {[
            ['Будни', '08:00 · 17:00'],
            ['Суббота', '08:00 · 10:00 · 17:00'],
            ['Воскресенье', '07:00 · 10:00 · 17:00'],
          ].map(([day, time]) => (
            <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(196,149,42,0.1)' }}>
              <span style={{
                fontFamily: 'var(--ff-sans)',
                fontSize: '0.75rem',
                color: 'var(--text)',
                fontWeight: 300,
              }}>
                {day}
              </span>
              <span style={{
                fontFamily: 'var(--ff-sans)',
                fontSize: '0.72rem',
                color: 'var(--muted)',
                fontWeight: 300,
              }}>
                {time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(196,149,42,0.1)',
        paddingTop: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--ff-sans)',
          fontSize: '0.65rem',
          color: 'var(--muted)',
          letterSpacing: '0.1em',
          fontWeight: 300,
        }}>
          © {new Date().getFullYear()} Храм Архангела Михаила. Алупка, Крым.
        </p>
        <p style={{
          fontFamily: 'var(--ff-serif)',
          fontSize: '0.9rem',
          fontStyle: 'italic',
          color: 'rgba(196,149,42,0.5)',
        }}>
          Слава Богу за всё
        </p>
      </div>
    </footer>
  )
}
