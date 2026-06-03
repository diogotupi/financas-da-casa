import { normalizeExpense } from './expenses'
import type { Expense } from '../types'

const CACHE_KEY = 'financas-da-casa-expenses-cache'

export function readExpensesCache(): Expense[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeExpense).filter((e): e is Expense => e !== null)
  } catch {
    return []
  }
}

export function writeExpensesCache(expenses: Expense[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(expenses))
  } catch {
    // quota ou modo privado
  }
}
