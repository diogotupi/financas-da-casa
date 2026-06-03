import type { Expense, MonthKey, Profiles } from '../types'
import { MonthNavigator } from './MonthNavigator'
import { MonthlyTotals } from './MonthlyTotals'
import { PersonExpenseList } from './PersonExpenseList'

interface Props {
  expenses: Expense[]
  monthKey: MonthKey
  onMonthChange: (monthKey: MonthKey) => void
  profiles: Profiles
  onRemove: (id: string) => Promise<void>
  onUpdate: (
    id: string,
    patch: { description?: string; amount?: number },
    options?: { fromInstallmentSlice?: boolean },
  ) => Promise<void>
  disabled?: boolean
}

export function MonthlyView({
  expenses,
  monthKey,
  onMonthChange,
  profiles,
  onRemove,
  onUpdate,
  disabled,
}: Props) {
  return (
    <section className="monthly-view">
      <MonthNavigator monthKey={monthKey} onChange={onMonthChange} />
      <MonthlyTotals expenses={expenses} monthKey={monthKey} profiles={profiles} />
      <div className="monthly-columns">
        <PersonExpenseList
          person="diogo"
          expenses={expenses}
          monthKey={monthKey}
          onRemove={onRemove}
          onUpdate={onUpdate}
          disabled={disabled}
        />
        <PersonExpenseList
          person="camila"
          expenses={expenses}
          monthKey={monthKey}
          onRemove={onRemove}
          onUpdate={onUpdate}
          disabled={disabled}
        />
      </div>
    </section>
  )
}
