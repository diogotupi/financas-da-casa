import type { Expense, MonthKey, PaymentMethod, Person } from '../types'
import { PEOPLE } from '../types'

export interface MonthlyEntry {
  expenseId: string
  label: string
  amount: number
  paidBy: Person
  purchaseDate: string
  paymentMethod: PaymentMethod
  installment?: { current: number; total: number }
}

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

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

function installmentAmounts(total: number, count: number): number[] {
  const base = roundMoney(total / count)
  const amounts = Array.from({ length: count }, () => base)
  const sum = roundMoney(base * (count - 1))
  amounts[count - 1] = roundMoney(total - sum)
  return amounts
}

/** Expande gasto em entradas mensais (crédito parcelado em meses seguintes) */
export function expandExpenseEntries(
  expense: Expense,
): { monthKey: MonthKey; entry: MonthlyEntry }[] {
  const method = expense.paymentMethod ?? 'pix'
  const installments = expense.installments ?? 1

  if (method !== 'credito' || installments < 2) {
    return [
      {
        monthKey: getMonthKey(expense.date),
        entry: {
          expenseId: expense.id,
          label: expense.description,
          amount: expense.amount,
          paidBy: expense.paidBy,
          purchaseDate: expense.date,
          paymentMethod: method === 'credito' ? 'credito' : method,
        },
      },
    ]
  }

  const amounts = installmentAmounts(expense.amount, installments)
  const startMonth = getMonthKey(expense.date)

  return amounts.map((amount, i) => ({
    monthKey: shiftMonth(startMonth, i),
    entry: {
      expenseId: expense.id,
      label: `${expense.description} ${i + 1}/${installments}`,
      amount,
      paidBy: expense.paidBy,
      purchaseDate: expense.date,
      paymentMethod: 'credito',
      installment: { current: i + 1, total: installments },
    },
  }))
}

export function getMonthlyEntriesForMonth(
  expenses: Expense[],
  monthKey: MonthKey,
  person: Person,
): MonthlyEntry[] {
  const entries: MonthlyEntry[] = []

  for (const expense of expenses) {
    if (expense.paidBy !== person) continue
    for (const { monthKey: mk, entry } of expandExpenseEntries(expense)) {
      if (mk === monthKey) entries.push(entry)
    }
  }

  return entries.sort(
    (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
  )
}

export function totalsForMonth(expenses: Expense[], monthKey: MonthKey) {
  let diogo = 0
  let camila = 0

  for (const expense of expenses) {
    for (const { monthKey: mk, entry } of expandExpenseEntries(expense)) {
      if (mk !== monthKey) continue
      if (entry.paidBy === 'diogo') diogo += entry.amount
      else camila += entry.amount
    }
  }

  return {
    diogo: roundMoney(diogo),
    camila: roundMoney(camila),
    all: roundMoney(diogo + camila),
  }
}

export function getAvailableMonths(expenses: Expense[]): MonthKey[] {
  const set = new Set<MonthKey>()
  for (const expense of expenses) {
    for (const { monthKey } of expandExpenseEntries(expense)) {
      set.add(monthKey)
    }
  }
  set.add(currentMonthKey())
  return [...set].sort((a, b) => b.localeCompare(a))
}

export function findExpense(expenses: Expense[], id: string) {
  return expenses.find((e) => e.id === id)
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

  const paymentMethod =
    e.paymentMethod === 'pix' ||
    e.paymentMethod === 'debito' ||
    e.paymentMethod === 'credito'
      ? e.paymentMethod
      : 'pix'

  let installments: number | undefined
  if (typeof e.installments === 'number' && e.installments >= 2) {
    installments = Math.floor(e.installments)
  }

  return {
    id: e.id,
    description: e.description,
    amount: e.amount,
    paidBy: e.paidBy,
    date: e.date,
    paymentMethod,
    ...(paymentMethod === 'credito' && installments ? { installments } : {}),
  }
}
