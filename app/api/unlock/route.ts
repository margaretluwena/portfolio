import { NextRequest, NextResponse } from 'next/server'
import { PROTECTED_SLUGS } from '@/lib/projects'

const PASSWORDS: Record<string, string | undefined> = {
  mark: process.env.MARK_PASSWORD,
  'impeccable-chicken': process.env.IMPECCABLE_CHICKEN_PASSWORD,
}

export async function POST(request: NextRequest) {
  const { slug, password } = await request.json()

  if (!slug || typeof slug !== 'string' || !PROTECTED_SLUGS.includes(slug)) {
    return NextResponse.json({ error: 'Invalid project' }, { status: 400 })
  }

  const expected = PASSWORDS[slug]
  if (!expected) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  if (password !== expected) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(`unlocked_${slug}`, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return response
}
