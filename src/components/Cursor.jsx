import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const styles = {
  outer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '1px solid var(--gold)',
    pointerEvents: 'none',
    zIndex: 9999,
    transform: 'translate(-50%, -50%)',
    mixBlendMode: 'normal',
    transition: 'width 0.3s var(--ease-out), height 0.3s var(--ease-out), background 0.3s',
  },
  dot: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--gold)',
    pointerEvents: 'none',
    zIndex: 10000,
    transform: 'translate(-50%, -50%)',
  },
}

export default function Cursor() {
  const outerRef = useRef(null)
  const dotRef = useRef(null)
  const pos = useRef({ x: -100, y: -100 })
  const curr = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const outer = outerRef.current
    const dot = dotRef.current

    const onMove = e => {
      pos.current = { x: e.clientX, y: e.clientY }
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0, overwrite: true })
    }

    const raf = () => {
      curr.current.x += (pos.current.x - curr.current.x) * 0.12
      curr.current.y += (pos.current.y - curr.current.y) * 0.12
      gsap.set(outer, { x: curr.current.x, y: curr.current.y })
      requestAnimationFrame(raf)
    }

    const onEnter = () => {
      outer.style.width = '70px'
      outer.style.height = '70px'
      outer.style.background = 'rgba(196, 149, 42, 0.08)'
    }
    const onLeave = () => {
      outer.style.width = '40px'
      outer.style.height = '40px'
      outer.style.background = 'transparent'
    }

    window.addEventListener('mousemove', onMove)
    document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    const rafId = requestAnimationFrame(raf)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div ref={outerRef} style={styles.outer} />
      <div ref={dotRef} style={styles.dot} />
    </>
  )
}
