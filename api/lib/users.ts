import { githubGetJson } from './github.js'

export type HouseUser = 'diogo' | 'camila'

const USERS_PATH = 'data/users.json'
const LEGACY_PASSWORD_PATH = 'data/password.json'
export const DEFAULT_PASSWORD = 'abc123'

const DEFAULT_USERS: Record<HouseUser, string> = {
  diogo: DEFAULT_PASSWORD,
  camila: DEFAULT_PASSWORD,
}

export function isHouseUser(value: unknown): value is HouseUser {
  return value === 'diogo' || value === 'camila'
}

function readUsersMap(data: unknown): Partial<Record<HouseUser, string>> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
  const out: Partial<Record<HouseUser, string>> = {}
  for (const key of ['diogo', 'camila'] as const) {
    const p = (data as Record<string, unknown>)[key]
    if (typeof p === 'string' && p.length > 0) out[key] = p
  }
  return out
}

function isGitHubUnavailable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : ''
  return msg.includes('rate limit') || msg.includes('github get falhou')
}

/** Nunca lança — em falha do GitHub usa senhas padrão para o site não ficar trancado */
export async function loadUserPasswords(): Promise<Record<HouseUser, string>> {
  let usersRaw: unknown = null
  try {
    usersRaw = await githubGetJson(USERS_PATH)
  } catch (err) {
    if (isGitHubUnavailable(err)) return { ...DEFAULT_USERS }
  }

  const map = readUsersMap(usersRaw)
  if (map.diogo && map.camila) {
    return { diogo: map.diogo, camila: map.camila }
  }
  if (map.diogo || map.camila) {
    return {
      diogo: map.diogo ?? DEFAULT_PASSWORD,
      camila: map.camila ?? DEFAULT_PASSWORD,
    }
  }

  try {
    const legacyRaw = await githubGetJson(LEGACY_PASSWORD_PATH)
    let legacy = DEFAULT_PASSWORD
    if (legacyRaw && typeof legacyRaw === 'object' && !Array.isArray(legacyRaw)) {
      const p = (legacyRaw as { password?: unknown }).password
      if (typeof p === 'string' && p.length > 0) legacy = p
    }
    return { diogo: legacy, camila: legacy }
  } catch (err) {
    if (isGitHubUnavailable(err)) return { ...DEFAULT_USERS }
    return { ...DEFAULT_USERS }
  }
}

export function verifyUserPassword(
  users: Record<HouseUser, string>,
  user: unknown,
  password: unknown,
): user is HouseUser {
  if (!isHouseUser(user) || typeof password !== 'string') return false
  return users[user] === password
}
