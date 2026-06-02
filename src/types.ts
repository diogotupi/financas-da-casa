export type Person = 'diogo' | 'camila'

export interface Expense {
  id: string
  description: string
  amount: number
  paidBy: Person
  date: string
  settled: boolean
}

export const PEOPLE = {
  diogo: { name: 'Diogo', initial: 'D', color: '#6b6b6b' },
  camila: { name: 'Camila', initial: 'C', color: '#820006' },
} as const
