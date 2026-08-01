import { cookies } from 'next/headers'
import {
  ACCESS_COOKIE_KEYS,
  getPostLoginDestination,
  resolveAccessRoleFromCookies,
} from './recovery/auth-foundation'

export async function getOperatorAccessState() {
  const cookieStore = await cookies()
  const role = resolveAccessRoleFromCookies({
    [ACCESS_COOKIE_KEYS.role]: cookieStore.get(ACCESS_COOKIE_KEYS.role)?.value,
    [ACCESS_COOKIE_KEYS.authReady]: cookieStore.get(ACCESS_COOKIE_KEYS.authReady)?.value,
  })

  return {
    role,
    isOperator: role === 'operator',
    isAuthenticated: role !== 'anonymous',
    postLoginDestination: getPostLoginDestination(role),
  }
}