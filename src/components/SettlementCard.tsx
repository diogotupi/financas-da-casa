import { calculateSettlement, formatMoney, personLabel } from '../lib/settlement'
import type { Expense, Profiles } from '../types'
import { Avatar } from './Avatar'

interface Props {
  expenses: Expense[]
  profiles: Profiles
}

export function SettlementCard({ expenses, profiles }: Props) {
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
            <Avatar
              person={settlement.from}
              photo={profiles[settlement.from]}
              size="large"
            />
            <div className="settlement-arrow">
              <span>deve</span>
              <strong>{formatMoney(settlement.amount)}</strong>
              <span className="arrow">→</span>
            </div>
            <Avatar
              person={settlement.to}
              photo={profiles[settlement.to]}
              size="large"
            />
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
