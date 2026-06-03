import { loginUser, updateUserPassword, isRateLimitError } from './sync'
import { cachePasswordForUser, verifyOfflinePassword } from './userPasswordCache'
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

function isOfflineLoginError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  if (isRateLimitError(err)) return true
  const msg = err.message.toLowerCase()
  return (
    msg.includes('não foi possível entrar') ||
    msg.includes('github get falhou') ||
    msg.includes('erro interno')
  )
}

export async function login(user: Person, password: string): Promise<void> {
  try {
    await loginUser(user, password)
  } catch (err) {
    if (isOfflineLoginError(err) && verifyOfflinePassword(user, password)) {
      writeSession({ user, password })
      cachePasswordForUser(user, password)
      return
    }
    throw err
  }
  writeSession({ user, password })
  cachePasswordForUser(user, password)
}

export async function logout(): Promise<void> {
  clearSession()
}

let initPromise: Promise<boolean> | null = null

/** Revalida sessão; se a API estiver no limite, mantém sessão com senha em cache */
export function initAuth(): Promise<boolean> {
  if (!initPromise) {
    initPromise = (async () => {
      const session = readSession()
      if (!session) return false
      try {
        await loginUser(session.user, session.password)
        return true
      } catch (err) {
        if (
          isOfflineLoginError(err) &&
          verifyOfflinePassword(session.user, session.password)
        ) {
          return true
        }
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

  if (session.password !== current) {
    throw new Error('Senha atual incorreta.')
  }

  try {
    await updateUserPassword(session.user, current, trimmed)
  } catch (err) {
    if (!isOfflineLoginError(err)) throw err
    // sem API: ainda atualiza cache local para login offline
  }

  writeSession({ user: session.user, password: trimmed })
  cachePasswordForUser(session.user, trimmed)
}
