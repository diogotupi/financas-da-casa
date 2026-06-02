import { useMemo, useState } from 'react'
import {
  formatDate,
  formatMoney,
  getDebtForExpense,
  halfShare,
  personLabel,
} from '../lib/settlement'
import type { Expense } from '../types'
import { PEOPLE } from '../types'

type Filter = 'all' | 'pending' | 'settled'

interface Props {
  expenses: Expense[]
  onToggleSettled: (id: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
  disabled?: boolean
}

export function ExpenseTable({ expenses, onToggleSettled, onRemove, disabled }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    const list = [...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    if (filter === 'pending') return list.filter((e) => !e.settled)
    if (filter === 'settled') return list.filter((e) => e.settled)
    return list
  }, [expenses, filter])

  const counts = useMemo(
    () => ({
      all: expenses.length,
      pending: expenses.filter((e) => !e.settled).length,
      settled: expenses.filter((e) => e.settled).length,
    }),
    [expenses],
  )

  return (
    <section className="expense-table-section">
      <div className="table-header">
        <h2>Planilha da casa</h2>
        <div className="filter-tabs" role="tablist">
          {(
            [
              ['all', 'Todos'],
              ['pending', 'Pendentes'],
              ['settled', 'Pagos'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              className={`filter-tab ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="filter-count">{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>
            {filter === 'all'
              ? 'Nenhum gasto ainda. Registrem o primeiro acima!'
              : filter === 'pending'
                ? 'Nenhum item pendente — que bom!'
                : 'Nenhum item marcado como pago ainda.'}
          </p>
        </div>
      ) : (
        <div className="expense-list">
          {filtered.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onToggleSettled={onToggleSettled}
              onRemove={onRemove}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function ExpenseRow({
  expense,
  onToggleSettled,
  onRemove,
  disabled,
}: {
  expense: Expense
  onToggleSettled: (id: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
  disabled?: boolean
}) {
  const debt = getDebtForExpense(expense)
  const share = halfShare(expense.amount)
  const payer = PEOPLE[expense.paidBy]

  return (
    <article className={`expense-row ${expense.settled ? 'settled' : ''}`}>
      <div className="row-main">
        <div
          className="avatar"
          style={{ background: payer.color }}
          title={`Pago por ${payer.name}`}
        >
          {payer.initial}
        </div>

        <div className="row-info">
          <div className="row-title-line">
            <strong>{expense.description}</strong>
            <span className="row-date">{formatDate(expense.date)}</span>
          </div>
          <p className="row-meta">
            {payer.name} pagou {formatMoney(expense.amount)} · metade:{' '}
            {formatMoney(share)}
          </p>
          {debt && (
            <p className="row-debt">
              → {personLabel(debt.owes)} deve {formatMoney(debt.amount)} para{' '}
              {personLabel(debt.to)}
            </p>
          )}
          {expense.settled && <p className="row-paid-badge">Acerto feito</p>}
        </div>

        <div className="row-amount">{formatMoney(expense.amount)}</div>
      </div>

      <div className="row-actions">
        <label className={`pago-toggle ${disabled ? 'is-disabled' : ''}`}>
          <input
            type="checkbox"
            checked={expense.settled}
            disabled={disabled}
            onChange={() => void onToggleSettled(expense.id)}
          />
          <span className="pago-slider" />
          <span className="pago-label">PAGO</span>
        </label>

        <button
          type="button"
          className="btn-ghost btn-delete"
          disabled={disabled}
          onClick={() => void onRemove(expense.id)}
          title="Remover"
          aria-label="Remover gasto"
        >
          Remover
        </button>
      </div>
    </article>
  )
}
