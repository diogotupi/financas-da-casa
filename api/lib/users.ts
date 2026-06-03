import { githubGetJson } from './github.js'

export type HouseUser = 'diogo' | 'camila'

const USERS_PATH = 'data/users.json'
const LEGACY_PASSWORD_PATH = 'data/password.json'
const DEFAULT_PASSWORD = 'abc123'

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

export async function loadUserPasswords(): Promise<Record<HouseUser, string>> {
  const usersRaw = await githubGetJson(USERS_PATH)
  const map = readUsersMap(usersRaw)
  if (map.diogo && map.camila) {
    return { diogo: map.diogo, camila: map.camila }
  }

  const legacyRaw = await githubGetJson(LEGACY_PASSWORD_PATH)
  let legacy = DEFAULT_PASSWORD
  if (legacyRaw && typeof legacyRaw === 'object' && !Array.isArray(legacyRaw)) {
    const p = (legacyRaw as { password?: unknown }).password
    if (typeof p === 'string' && p.length > 0) legacy = p
  }

  return {
    diogo: map.diogo ?? legacy,
    camila: map.camila ?? legacy,
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
