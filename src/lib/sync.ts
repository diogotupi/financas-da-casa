import type { Expense } from '../types'

export const SYNC_API =
  import.meta.env.VITE_SYNC_API || 'https://financas-da-casa-sync.vercel.app/api/expenses'

export const isSyncConfigured = Boolean(SYNC_API)

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch(SYNC_API, { cache: 'no-store' })
  if (!res.ok) throw new Error('Não foi possível carregar a planilha')
  const data = await res.json()
  return Array.isArray(data) ? (data as Expense[]) : []
}

export async function saveExpenses(expenses: Expense[]): Promise<void> {
  const res = await fetch(SYNC_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenses),
  })
  if (!res.ok) throw new Error('Não foi possível salvar a planilha')
}
