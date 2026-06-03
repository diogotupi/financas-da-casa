export type Person = 'diogo' | 'camila'

export type Profiles = Partial<Record<Person, string>>

/** Chave do mês: YYYY-MM */
export type MonthKey = string

export type PaymentMethod = 'pix' | 'debito' | 'credito'

export interface Expense {
  id: string
  description: string
  /** Valor total (à vista ou total parcelado no crédito) */
  amount: number
  paidBy: Person
  date: string
  paymentMethod: PaymentMethod
  /** Só para crédito — número de parcelas (≥ 2) */
  installments?: number
}

export const PEOPLE = {
  diogo: { name: 'Diogo', initial: 'D', color: '#c45c4a' },
  camila: { name: 'Camila', initial: 'C', color: '#5b8a72' },
} as const

export const PAYMENT_METHODS = {
  pix: { label: 'PIX' },
  debito: { label: 'Débito' },
  credito: { label: 'Crédito' },
} as const
