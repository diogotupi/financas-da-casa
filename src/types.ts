export type Person = 'diogo' | 'camila'

export type Profiles = Partial<Record<Person, string>>

/** Chave do mês: YYYY-MM */
export type MonthKey = string

export interface Expense {
  id: string
  description: string
  amount: number
  paidBy: Person
  date: string
}

export const PEOPLE = {
  diogo: { name: 'Diogo', initial: 'D', color: '#c45c4a' },
  camila: { name: 'Camila', initial: 'C', color: '#5b8a72' },
} as const
