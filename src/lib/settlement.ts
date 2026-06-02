import type { Expense, Person } from '../types'
import { PEOPLE } from '../types'

export interface Settlement {
  from: Person
  to: Person
  amount: number
}

export function halfShare(amount: number) {
  return amount / 2
}

export function getDebtForExpense(expense: Expense): { owes: Person; to: Person; amount: number } | null {
  if (expense.settled) return null
  const share = halfShare(expense.amount)
  const owes: Person = expense.paidBy === 'diogo' ? 'camila' : 'diogo'
  return { owes, to: expense.paidBy, amount: share }
}

export function calculateSettlement(expenses: Expense[]): Settlement | null {
  let diogoIsOwed = 0
  let camilaIsOwed = 0

  for (const expense of expenses) {
    if (expense.settled) continue
    const share = halfShare(expense.amount)
    if (expense.paidBy === 'diogo') diogoIsOwed += share
    else camilaIsOwed += share
  }

  const net = diogoIsOwed - camilaIsOwed
  if (Math.abs(net) < 0.01) return null

  if (net > 0) {
    return { from: 'camila', to: 'diogo', amount: net }
  }
  return { from: 'diogo', to: 'camila', amount: Math.abs(net) }
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
