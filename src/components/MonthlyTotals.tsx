import type { CSSProperties } from 'react'
import { formatMoney, totalsForMonth } from '../lib/expenses'
import type { Expense, MonthKey, Profiles } from '../types'
import { PEOPLE } from '../types'
import { Avatar } from './Avatar'

interface Props {
  expenses: Expense[]
  monthKey: MonthKey
  profiles: Profiles
}

export function MonthlyTotals({ expenses, monthKey, profiles }: Props) {
  const totals = totalsForMonth(expenses, monthKey)

  return (
    <div className="monthly-totals">
      {(['diogo', 'camila'] as const).map((person) => (
        <div
          key={person}
          className="monthly-total-card"
          style={{ '--person-color': PEOPLE[person].color } as CSSProperties}
        >
          <Avatar person={person} photo={profiles[person]} size="large" />
          <p className="monthly-total-name">{PEOPLE[person].name}</p>
          <p className="monthly-total-label">gastou este mês</p>
          <p className="monthly-total-amount">{formatMoney(totals[person])}</p>
        </div>
      ))}
    </div>
  )
}
