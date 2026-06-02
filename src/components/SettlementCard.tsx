import { calculateSettlement, formatMoney, personLabel } from '../lib/settlement'
import type { Expense } from '../types'
import { PEOPLE } from '../types'

interface Props {
  expenses: Expense[]
}

export function SettlementCard({ expenses }: Props) {
  const pending = expenses.filter((e) => !e.settled)
  const settlement = calculateSettlement(expenses)
  const pendingTotal = pending.reduce((s, e) => s + e.amount, 0)

  return (
    <section className="settlement-card">
      <div className="settlement-header">
        <span className="settlement-icon" aria-hidden>
          ⚖️
        </span>
        <div>
          <h2>Acerto de contas</h2>
          <p className="settlement-sub">
            {pending.length === 0
              ? 'Nada pendente — vocês estão em dia!'
              : `${pending.length} item${pending.length !== 1 ? 's' : ''} em aberto · ${formatMoney(pendingTotal)} no total`}
          </p>
        </div>
      </div>

      {settlement ? (
        <div className="settlement-result">
          <div className="settlement-flow">
            <div
              className="avatar large"
              style={{ background: PEOPLE[settlement.from].color }}
            >
              {PEOPLE[settlement.from].initial}
            </div>
            <div className="settlement-arrow">
              <span>deve</span>
              <strong>{formatMoney(settlement.amount)}</strong>
              <span className="arrow">→</span>
            </div>
            <div
              className="avatar large"
              style={{ background: PEOPLE[settlement.to].color }}
            >
              {PEOPLE[settlement.to].initial}
            </div>
          </div>
          <p className="settlement-text">
            <strong>{personLabel(settlement.from)}</strong> deve{' '}
            <strong>{formatMoney(settlement.amount)}</strong> para{' '}
            <strong>{personLabel(settlement.to)}</strong>
          </p>
        </div>
      ) : (
        <div className="settlement-balanced">
          <span className="balanced-emoji" aria-hidden>
            ✨
          </span>
          <p>Tudo certinho entre vocês dois!</p>
        </div>
      )}
    </section>
  )
}
