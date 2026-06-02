import type { Expense, Profiles } from '../types'

const API_BASE =
  import.meta.env.VITE_SYNC_API?.replace(/\/api\/expenses$/, '') ||
  'https://financas-da-casa-sync.vercel.app'

export const EXPENSES_API = `${API_BASE}/api/expenses`
export const PROFILES_API = `${API_BASE}/api/profiles`

export const isSyncConfigured = Boolean(EXPENSES_API)

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch(EXPENSES_API, { cache: 'no-store' })
  if (!res.ok) throw new Error('Não foi possível carregar a planilha')
  const data = await res.json()
  return Array.isArray(data) ? (data as Expense[]) : []
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  const res = await fetch(EXPENSES_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenses),
  })
  if (!res.ok) throw new Error('Não foi possível salvar a planilha')
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
