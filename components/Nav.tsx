'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <Link
        href="/"
        className="text-xs font-roboto-condensed tracking-widest text-white border border-white rounded-full px-4 py-1.5 hover:bg-white hover:text-black transition-colors"
      >
        Index
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href={isHome ? '#info' : '/#info'}
          className="text-xs font-roboto-condensed tracking-widest text-white border border-white rounded-full px-4 py-1.5 hover:bg-white hover:text-black transition-colors"
        >
          Info
        </Link>
        <Link
          href="/works"
          className="text-xs font-roboto-condensed tracking-widest text-white border border-white rounded-full px-4 py-1.5 hover:bg-white hover:text-black transition-colors"
        >
          Works
        </Link>
        <a
          href="mailto:luwena@usc.edu"
          className="text-xs font-roboto-condensed tracking-widest text-white border border-white rounded-full px-4 py-1.5 hover:bg-white hover:text-black transition-colors"
        >
          Contact
        </a>
      </div>
    </nav>
  )
}
