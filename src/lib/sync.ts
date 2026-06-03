import { normalizeExpense } from './expenses'
import type { Expense, Person, Profiles } from '../types'
import type { Session } from './auth'

const API_BASE =
  import.meta.env.VITE_SYNC_API?.replace(/\/api\/expenses$/, '') ||
  'https://financas-da-casa-sync.vercel.app'

export const EXPENSES_API = `${API_BASE}/api/expenses`
export const PROFILES_API = `${API_BASE}/api/profiles`
export const LOGIN_API = `${API_BASE}/api/login`
export const USER_PASSWORD_API = `${API_BASE}/api/user-password`
export const SYNC_API = `${API_BASE}/api/sync`

export const isSyncConfigured = Boolean(EXPENSES_API)

function parseExpensesList(data: unknown): Expense[] {
  if (!Array.isArray(data)) return []
  return data.map(normalizeExpense).filter((e): e is Expense => e !== null)
}

export function isRateLimitError(err: Error): boolean {
  const msg = err.message.toLowerCase()
  return msg.includes('rate limit') || msg.includes('limite')
}

async function readApiError(res: Response, fallback: string): Promise<Error> {
  try {
    const body = await res.json()
    if (body && typeof body.error === 'string') {
      return new Error(body.error)
    }
  } catch {
    // ignore
  }
  return new Error(fallback)
}

export async function loginUser(user: Person, password: string): Promise<void> {
  const res = await fetch(LOGIN_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, password }),
  })
  if (res.status === 403) {
    throw new Error('Usuário ou senha incorretos.')
  }
  if (!res.ok) {
    throw await readApiError(res, 'Não foi possível entrar')
  }
}

export async function updateUserPassword(
  user: Person,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(USER_PASSWORD_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, currentPassword, newPassword }),
  })
  if (res.status === 403) {
    throw new Error('Senha atual incorreta.')
  }
  if (!res.ok) {
    throw await readApiError(res, 'Não foi possível salvar a senha')
  }
}

/** Poll único: 1 HTTP do browser, 2 GET no GitHub */
export async function fetchSyncBundle(): Promise<{ expenses: Expense[]; profiles: Profiles }> {
  const res = await fetch(SYNC_API, { cache: 'no-store' })
  if (!res.ok) {
    throw await readApiError(res, 'Não foi possível carregar a planilha')
  }
  const data = await res.json()
  const profiles =
    data?.profiles && typeof data.profiles === 'object' && !Array.isArray(data.profiles)
      ? (data.profiles as Profiles)
      : {}
  return { expenses: parseExpensesList(data?.expenses), profiles }
}

export async function saveExpenses(expenses: Expense[], session: Session): Promise<void> {
  const res = await fetch(EXPENSES_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: session.user,
      password: session.password,
      expenses,
    }),
  })
  if (res.status === 403) {
    throw await readApiError(res, 'Sem permissão para alterar estes gastos')
  }
  if (!res.ok) {
    throw await readApiError(res, 'Não foi possível salvar a planilha')
  }
}

export async function saveProfiles(profiles: Profiles, session: Session): Promise<void> {
  const res = await fetch(PROFILES_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: session.user,
      password: session.password,
      profiles,
    }),
  })
  if (res.status === 403) {
    throw await readApiError(res, 'Sem permissão para alterar este perfil')
  }
  if (!res.ok) {
    throw await readApiError(res, 'Não foi possível salvar a foto')
  }
}
