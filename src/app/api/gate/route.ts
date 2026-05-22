import { NextResponse } from 'next/server'

const PASSWORD = 'datum-poc-2026!'
const COOKIE_NAME = 'catalog-auth'
const COOKIE_VALUE = 'authenticated'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (password !== PASSWORD) {
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
