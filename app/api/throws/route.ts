import { NextResponse } from 'next/server'

/*
  Global player counter for the sky's fetch game: the first throw by each
  visitor claims the next number, which the dog hands back on the catch
  ("you're the 42nd person who's played with me!"). The client keeps its
  number in localStorage and never claims twice.

  Storage: a Redis-compatible REST store when its env vars exist - Vercel's
  KV / Upstash Redis integration sets KV_REST_API_URL + KV_REST_API_TOKEN
  (or UPSTASH_REDIS_REST_URL/_TOKEN) - so one INCR per throw, shared across
  every serverless instance and deploy. Without those vars (local dev, or
  before the store is attached in Vercel) it falls back to a process-local
  counter that resets on restart, so the game still works end to end.
*/

const KEY = 'sky:players'
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

const local = globalThis as typeof globalThis & { __skyThrows?: number }

async function redis(cmd: string): Promise<number> {
  const r = await fetch(`${url}/${cmd}/${KEY}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!r.ok) throw new Error(`store ${r.status}`)
  const j = (await r.json()) as { result?: number | string | null }
  return Number(j.result ?? 0)
}

async function read(): Promise<number> {
  if (url && token) return redis('get')
  return local.__skyThrows ?? 0
}

async function bump(): Promise<number> {
  if (url && token) return redis('incr')
  local.__skyThrows = (local.__skyThrows ?? 0) + 1
  return local.__skyThrows
}

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ throws: await read() })
  } catch {
    return NextResponse.json({ throws: null }, { status: 503 })
  }
}

export async function POST() {
  try {
    return NextResponse.json({ throws: await bump() })
  } catch {
    return NextResponse.json({ throws: null }, { status: 503 })
  }
}
