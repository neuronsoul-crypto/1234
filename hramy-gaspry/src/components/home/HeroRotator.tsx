'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export type HeroSlide = { src: string; alt: string; objectPosition: string }

/** Ротация 3–5 фото храма плавной сменой; при prefers-reduced-motion — одно фото. */
export function HeroRotator({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000)
    return () => clearInterval(t)
  }, [slides.length])

  return (
    <>
      {slides.map((s, i) => (
        <Image
          key={s.src}
          src={s.src}
          alt={i === index ? s.alt : ''}
          aria-hidden={i !== index}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1500ms] ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={{ objectPosition: s.objectPosition }}
        />
      ))}
    </>
  )
}
