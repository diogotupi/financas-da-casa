import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
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
  onUpdate: (
    id: string,
    patch: { description?: string; amount?: number },
  ) => Promise<void>
  disabled?: boolean
}

export function ExpenseTable({
  expenses,
  onToggleSettled,
  onRemove,
  onUpdate,
  disabled,
}: Props) {
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
              onUpdate={onUpdate}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function parseAmount(raw: string) {
  const parsed = parseFloat(raw.replace(',', '.').trim())
  return Number.isFinite(parsed) ? parsed : NaN
}

function ExpenseRow({
  expense,
  onToggleSettled,
  onRemove,
  onUpdate,
  disabled,
}: {
  expense: Expense
  onToggleSettled: (id: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
  onUpdate: (
    id: string,
    patch: { description?: string; amount?: number },
  ) => Promise<void>
  disabled?: boolean
}) {
  const debt = getDebtForExpense(expense)
  const share = halfShare(expense.amount)
  const payer = PEOPLE[expense.paidBy]

  const [description, setDescription] = useState(expense.description)
  const [amount, setAmount] = useState(formatAmountInput(expense.amount))
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!editing) {
      setDescription(expense.description)
      setAmount(formatAmountInput(expense.amount))
    }
  }, [expense.description, expense.amount, editing])

  async function commitEdits() {
    const nextDescription = description.trim()
    const nextAmount = parseAmount(amount)

    if (!nextDescription || !nextAmount || nextAmount <= 0) {
      setDescription(expense.description)
      setAmount(formatAmountInput(expense.amount))
      return
    }

    await onUpdate(expense.id, {
      description: nextDescription,
      amount: nextAmount,
    })
  }

  function handleDescriptionBlur() {
    setEditing(false)
    void commitEdits()
  }

  function handleAmountBlur() {
    setEditing(false)
    void commitEdits()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.currentTarget instanceof HTMLElement && e.currentTarget.blur()
    }
    if (e.key === 'Escape') {
      setDescription(expense.description)
      setAmount(formatAmountInput(expense.amount))
      setEditing(false)
      e.currentTarget instanceof HTMLElement && e.currentTarget.blur()
    }
  }

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
            <input
              type="text"
              className="row-edit row-edit-title"
              value={description}
              disabled={disabled}
              aria-label="Descrição do gasto"
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setEditing(true)}
              onBlur={handleDescriptionBlur}
              onKeyDown={handleKeyDown}
            />
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

        <input
          type="text"
          inputMode="decimal"
          className="row-edit row-edit-amount"
          value={amount}
          disabled={disabled}
          aria-label="Valor do gasto em reais"
          onChange={(e) => setAmount(e.target.value)}
          onFocus={() => setEditing(true)}
          onBlur={handleAmountBlur}
          onKeyDown={handleKeyDown}
        />
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

function formatAmountInput(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
