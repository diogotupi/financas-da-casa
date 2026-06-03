import type { HouseUser } from './users.js'

type ExpenseRow = {
  id: string
  paidBy: string
  [key: string]: unknown
}

function stableRow(e: ExpenseRow): string {
  return JSON.stringify(e)
}

export function mergeExpensesForUser(
  existing: ExpenseRow[],
  incoming: ExpenseRow[],
  user: HouseUser,
): ExpenseRow[] {
  const incomingById = new Map(incoming.map((e) => [e.id, e]))
  const result: ExpenseRow[] = []

  for (const old of existing) {
    const inc = incomingById.get(old.id)
    if (old.paidBy === user) {
      if (!inc) continue
      if (inc.paidBy !== user) {
        throw new Error('Não é permitido alterar o responsável de um gasto')
      }
      result.push(inc)
    } else {
      if (inc && stableRow(inc) !== stableRow(old)) {
        throw new Error('Não é permitido editar gastos de outra pessoa')
      }
      result.push(old)
    }
  }

  const existingIds = new Set(existing.map((e) => e.id))
  for (const inc of incoming) {
    if (!existingIds.has(inc.id)) {
      if (inc.paidBy !== user) {
        throw new Error('Só pode adicionar gastos em seu próprio nome')
      }
      result.push(inc)
    }
  }

  return result
}
