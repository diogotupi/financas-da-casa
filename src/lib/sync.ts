import { normalizeExpense } from './expenses'
import type { Expense, Profiles } from '../types'

const API_BASE =
  import.meta.env.VITE_SYNC_API?.replace(/\/api\/expenses$/, '') ||
  'https://financas-da-casa-sync.vercel.app'

export const EXPENSES_API = `${API_BASE}/api/expenses`
export const PROFILES_API = `${API_BASE}/api/profiles`
export const PASSWORD_API = `${API_BASE}/api/password`
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

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch(EXPENSES_API, { cache: 'no-store' })
  if (!res.ok) throw await readApiError(res, 'Não foi possível carregar a planilha')
  const data = await res.json()
  return parseExpensesList(data)
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  const res = await fetch(EXPENSES_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenses),
  })
  if (!res.ok) throw await readApiError(res, 'Não foi possível salvar a planilha')
}

export async function fetchProfiles(): Promise<Profiles> {
  const res = await fetch(PROFILES_API, { cache: 'no-store' })
  if (!res.ok) throw new Error('Não foi possível carregar os perfis')
  const data = await res.json()
  return data && typeof data === 'object' && !Array.isArray(data)
    ? (data as Profiles)
    : {}
}

export async function saveProfiles(profiles: Profiles): Promise<void> {
  const res = await fetch(PROFILES_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profiles),
  })
  if (!res.ok) throw new Error('Não foi possível salvar a foto')
}

export async function fetchPassword(): Promise<string> {
  const res = await fetch(PASSWORD_API, { cache: 'no-store' })
  if (!res.ok) throw new Error('Não foi possível carregar a senha')
  const data = await res.json()
  if (data && typeof data.password === 'string' && data.password.length > 0) {
    return data.password
  }
  throw new Error('Resposta de senha inválida')
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(PASSWORD_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  if (res.status === 403) {
    throw new Error('Senha atual incorreta.')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err && typeof err.error === 'string' ? err.error : 'Não foi possível salvar a senha'
    throw new Error(msg)
  }
}
