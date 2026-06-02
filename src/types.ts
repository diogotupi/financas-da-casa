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
  diogo: { name: 'Diogo', initial: 'D', color: '#c45c4a' },
  camila: { name: 'Camila', initial: 'C', color: '#5b8a72' },
} as const
