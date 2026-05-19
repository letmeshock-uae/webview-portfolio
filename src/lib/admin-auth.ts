import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'admin_session'

export async function verifyAdminSession(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return false

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false

  try {
    await jwtVerify(token, new TextEncoder().encode(password))
    return true
  } catch {
    return false
  }
}
