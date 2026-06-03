import { formatMonthLabel, shiftMonth } from '../lib/expenses'
import type { MonthKey } from '../types'

interface Props {
  monthKey: MonthKey
  onChange: (monthKey: MonthKey) => void
}

export function MonthNavigator({ monthKey, onChange }: Props) {
  return (
    <div className="month-nav">
      <button
        type="button"
        className="month-nav-btn"
        onClick={() => onChange(shiftMonth(monthKey, -1))}
        aria-label="Mês anterior"
      >
        ‹
      </button>
      <h2 className="month-nav-label">{formatMonthLabel(monthKey)}</h2>
      <button
        type="button"
        className="month-nav-btn"
        onClick={() => onChange(shiftMonth(monthKey, 1))}
        aria-label="Próximo mês"
      >
        ›
      </button>
    </div>
  )
}
