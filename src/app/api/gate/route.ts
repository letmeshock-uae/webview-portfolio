import { NextResponse } from 'next/server'

const COOKIE_NAME = 'catalog-auth'
const COOKIE_VALUE = 'authenticated'

export async function POST(request: Request) {
  const { password } = await request.json()
  const expected = process.env.GATE_PASSWORD
  if (!expected) {
    return NextResponse.json({ error: 'GATE_PASSWORD not configured' }, { status: 500 })
  }

  if (password !== expected) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}
