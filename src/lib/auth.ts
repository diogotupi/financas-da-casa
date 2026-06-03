import { loginUser, updateUserPassword } from './sync'
import type { Person } from '../types'

const SESSION_KEY = 'financas-da-casa-session'

export type Session = { user: Person; password: string }

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (parsed?.user !== 'diogo' && parsed?.user !== 'camila') return null
    if (typeof parsed.password !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

function writeSession(session: Session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function getSession(): Session | null {
  return readSession()
}

export function getCurrentUser(): Person | null {
  return readSession()?.user ?? null
}

export function isAuthenticated(): boolean {
  return readSession() !== null
}

export async function login(user: Person, password: string): Promise<void> {
  await loginUser(user, password)
  writeSession({ user, password })
}

export async function logout(): Promise<void> {
  clearSession()
}

let initPromise: Promise<boolean> | null = null

/** Revalida sessão guardada com a API */
export function initAuth(): Promise<boolean> {
  if (!initPromise) {
    initPromise = (async () => {
      const session = readSession()
      if (!session) return false
      try {
        await loginUser(session.user, session.password)
        return true
      } catch {
        clearSession()
        return false
      }
    })()
  }
  return initPromise
}

export async function changePassword(current: string, next: string): Promise<void> {
  const session = readSession()
  if (!session) {
    throw new Error('Faça login novamente.')
  }

  const trimmed = next.trim()
  if (!trimmed) {
    throw new Error('Digite a nova senha.')
  }
  if (trimmed === current) {
    throw new Error('A nova senha deve ser diferente da atual.')
  }

  await updateUserPassword(session.user, current, trimmed)
  writeSession({ user: session.user, password: trimmed })
}
