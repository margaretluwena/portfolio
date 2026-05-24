'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PasswordGate({ slug, title }: { slug: string; title: string }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password }),
      })

      if (res.ok) {
        router.push(`/works/${slug}`)
        router.refresh()
      } else {
        setError('Incorrect password.')
        setPassword('')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <p className="text-white/40 text-[10px] font-roboto-condensed tracking-[0.3em] uppercase mb-2">
          Protected Project
        </p>
        <h1 className="text-white font-unbounded text-2xl mb-6">{title}</h1>
        <p className="text-white/50 text-xs font-roboto-condensed tracking-wide leading-relaxed mb-10">
          This project is covered by an NDA. Enter the password to view.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-transparent border border-white/30 text-white text-xs font-roboto-condensed tracking-widest px-4 py-3 placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-[10px] font-roboto-condensed tracking-widest">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full border border-white text-white text-xs font-roboto-condensed tracking-[0.3em] uppercase py-3 hover:bg-white hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
