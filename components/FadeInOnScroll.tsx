'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Extra delay in ms before the transition begins after entering view */
  delay?: number
  /** Tailwind/utility classes applied to the wrapper */
  className?: string
  /** Element root margin for the observer (CSS string) */
  rootMargin?: string
}

export default function FadeInOnScroll({
  children,
  delay = 0,
  className = '',
  rootMargin = '0px 0px -10% 0px',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Bail out immediately if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold: 0.05 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
