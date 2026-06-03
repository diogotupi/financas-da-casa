import type { Person } from '../types'

const CACHE_KEY = 'financas-da-casa-user-passwords'

const DEFAULTS: Record<Person, string> = {
  diogo: 'abc123',
  camila: 'abc123',
}

export function getCachedPasswords(): Record<Person, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<Record<Person, string>>
    return {
      diogo: parsed.diogo ?? DEFAULTS.diogo,
      camila: parsed.camila ?? DEFAULTS.camila,
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function cachePasswordForUser(user: Person, password: string) {
  const next = { ...getCachedPasswords(), [user]: password }
  localStorage.setItem(CACHE_KEY, JSON.stringify(next))
}

export function verifyOfflinePassword(user: Person, password: string): boolean {
  return getCachedPasswords()[user] === password
}
