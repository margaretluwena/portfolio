'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PILL = 'text-xs font-roboto-condensed tracking-widest text-white border border-white rounded-full px-4 py-1.5 hover:bg-white hover:text-black transition-colors t-smooth'

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className="w-full pt-3 pb-4 overflow-hidden">
      {/* Wordmark — full-width, single line, edge-to-edge */}
      <Link href="/" aria-label="Margaret Luwena — home" className="block px-2 overflow-hidden">
        <p
          className="font-unbounded font-normal text-white uppercase select-none whitespace-nowrap text-center leading-[0.9]"
          style={{
            fontSize: '7.5vw',
            letterSpacing: 'var(--tracking-display)',
          }}
        >
          MARGARET LUWENA
        </p>
      </Link>

      {/* Nav pills — distributed across the full width */}
      <nav className="flex items-center justify-between px-6 mt-4">
        <Link href="/" className={PILL}>
          Index
        </Link>
        <Link href={isHome ? '#info' : '/#info'} className={PILL}>
          Info
        </Link>
        <Link href="/works" className={PILL}>
          Works
        </Link>
        <a href="mailto:luwena@usc.edu" className={PILL}>
          Contact
        </a>
      </nav>
    </header>
  )
}
