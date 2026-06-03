import type { Expense, MonthKey, Person } from '../types'
import { PEOPLE } from '../types'

export function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export function personLabel(person: Person) {
  return PEOPLE[person].name
}

export function getMonthKey(date: string): MonthKey {
  return date.slice(0, 7)
}

export function currentMonthKey(): MonthKey {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function formatMonthLabel(monthKey: MonthKey, capitalize = true): string {
  const [y, m] = monthKey.split('-').map(Number)
  const label = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
  return capitalize
    ? label.charAt(0).toUpperCase() + label.slice(1)
    : label
}

export function shiftMonth(monthKey: MonthKey, delta: number): MonthKey {
  const [y, m] = monthKey.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  const ny = d.getFullYear()
  const nm = String(d.getMonth() + 1).padStart(2, '0')
  return `${ny}-${nm}`
}

export function defaultDateForMonth(monthKey: MonthKey): string {
  if (monthKey === currentMonthKey()) {
    return new Date().toISOString().slice(0, 10)
  }
  return `${monthKey}-01`
}

export function filterByMonth(expenses: Expense[], monthKey: MonthKey): Expense[] {
  return expenses.filter((e) => getMonthKey(e.date) === monthKey)
}

export function filterByMonthAndPerson(
  expenses: Expense[],
  monthKey: MonthKey,
  person: Person,
): Expense[] {
  return filterByMonth(expenses, monthKey)
    .filter((e) => e.paidBy === person)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function sumExpenses(list: Expense[]): number {
  return list.reduce((s, e) => s + e.amount, 0)
}

export function totalsForMonth(expenses: Expense[], monthKey: MonthKey) {
  const month = filterByMonth(expenses, monthKey)
  return {
    diogo: sumExpenses(month.filter((e) => e.paidBy === 'diogo')),
    camila: sumExpenses(month.filter((e) => e.paidBy === 'camila')),
    all: sumExpenses(month),
  }
}

export function getAvailableMonths(expenses: Expense[]): MonthKey[] {
  const set = new Set<MonthKey>()
  for (const e of expenses) set.add(getMonthKey(e.date))
  set.add(currentMonthKey())
  return [...set].sort((a, b) => b.localeCompare(a))
}

export function normalizeExpense(raw: unknown): Expense | null {
  if (!raw || typeof raw !== 'object') return null
  const e = raw as Record<string, unknown>
  if (
    typeof e.id !== 'string' ||
    typeof e.description !== 'string' ||
    typeof e.amount !== 'number' ||
    (e.paidBy !== 'diogo' && e.paidBy !== 'camila') ||
    typeof e.date !== 'string'
  ) {
    return null
  }
  return {
    id: e.id,
    description: e.description,
    amount: e.amount,
    paidBy: e.paidBy,
    date: e.date,
  }
}
