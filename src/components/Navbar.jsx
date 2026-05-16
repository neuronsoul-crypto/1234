import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const links = [
  { label: 'История', href: '#history' },
  { label: 'Расписание', href: '#schedule' },
  { label: 'Галерея', href: '#gallery' },
  { label: 'Пожертвования', href: '#donations' },
]

export default function Navbar() {
  const navRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, delay: 1.8, ease: 'power3.out' }
    )

    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleNav = e => {
    e.preventDefault()
    const id = e.currentTarget.getAttribute('href').slice(1)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav ref={navRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: '24px 48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: scrolled ? 'rgba(249, 245, 236, 0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(196, 149, 42, 0.15)' : '1px solid transparent',
      transition: 'background 0.5s, border-color 0.5s, backdrop-filter 0.5s',
      opacity: 0,
    }}>
      {/* Logo */}
      <a href="#" style={{
        fontFamily: 'var(--ff-serif)',
        fontSize: '1.1rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        color: scrolled ? 'var(--dark)' : 'var(--white)',
        transition: 'color 0.5s',
      }}>
        <CrossIcon size={24} color={scrolled ? 'var(--gold)' : 'var(--gold-light)'} />
      </a>

      {/* Desktop links */}
      <ul style={{
        display: 'flex',
        gap: '40px',
        listStyle: 'none',
        alignItems: 'center',
      }}>
        {links.map(link => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={handleNav}
              style={{
                fontFamily: 'var(--ff-sans)',
                fontSize: '0.72rem',
                fontWeight: 400,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: scrolled ? 'var(--muted)' : 'rgba(253, 250, 243, 0.75)',
                transition: 'color 0.3s',
                position: 'relative',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color = scrolled ? 'var(--muted)' : 'rgba(253,250,243,0.75)'}
            >
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <a
            href="#donations"
            onClick={handleNav}
            style={{
              fontFamily: 'var(--ff-sans)',
              fontSize: '0.72rem',
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              padding: '10px 20px',
              border: '1px solid var(--gold)',
              color: scrolled ? 'var(--dark)' : 'var(--white)',
              transition: 'all 0.3s',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--gold)'
              e.currentTarget.style.color = 'var(--white)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = scrolled ? 'var(--dark)' : 'var(--white)'
            }}
          >
            Помочь храму
          </a>
        </li>
      </ul>
    </nav>
  )
}

function CrossIcon({ size = 28, color = 'var(--gold)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="14" y1="2" x2="14" y2="26" stroke={color} strokeWidth="1.5" />
      <line x1="5" y1="9" x2="23" y2="9" stroke={color} strokeWidth="1.5" />
      <line x1="8" y1="14" x2="20" y2="14" stroke={color} strokeWidth="1" strokeOpacity="0.6" />
      <line x1="10" y1="22" x2="18" y2="22" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    </svg>
  )
}
