'use client'

import { useState } from 'react'

const EMAIL = 'luwena@usc.edu'

export default function CopyEmailButton() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable — fail silently
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 bg-black text-white border border-white rounded-full px-5 py-2.5 text-sm font-roboto-condensed tracking-wide hover:bg-white hover:text-black transition-[background-color,color] duration-[var(--duration-base,500ms)] [transition-timing-function:var(--ease-out-expo,cubic-bezier(0.22,1,0.36,1))]"
      aria-label="Copy email to clipboard"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span>{copied ? 'Copied!' : 'Copy Email'}</span>
    </button>
  )
}
