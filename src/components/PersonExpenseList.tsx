import { useEffect, useState, type KeyboardEvent } from 'react'
import {
  filterByMonthAndPerson,
  formatDate,
  formatMonthLabel,
} from '../lib/expenses'
import type { Expense, MonthKey, Person } from '../types'
import { PEOPLE } from '../types'

interface Props {
  person: Person
  expenses: Expense[]
  monthKey: MonthKey
  onRemove: (id: string) => Promise<void>
  onUpdate: (id: string, patch: { description?: string; amount?: number }) => Promise<void>
  disabled?: boolean
}

export function PersonExpenseList({
  person,
  expenses,
  monthKey,
  onRemove,
  onUpdate,
  disabled,
}: Props) {
  const list = filterByMonthAndPerson(expenses, monthKey, person)
  const monthLabel = formatMonthLabel(monthKey, false)

  return (
    <section className="person-month-section">
      <header className="person-month-header">
        <h3>
          Gastos {person === 'diogo' ? 'do' : 'da'} {PEOPLE[person].name} em {monthLabel}
        </h3>
        <span className="person-month-count">
          {list.length} {list.length === 1 ? 'item' : 'itens'}
        </span>
      </header>

      {list.length === 0 ? (
        <p className="person-month-empty">Nenhum gasto neste mês.</p>
      ) : (
        <ul className="person-month-list">
          {list.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onRemove={onRemove}
              onUpdate={onUpdate}
              disabled={disabled}
            />
          ))}
        </ul>
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
  onRemove,
  onUpdate,
  disabled,
}: {
  expense: Expense
  onRemove: (id: string) => Promise<void>
  onUpdate: (id: string, patch: { description?: string; amount?: number }) => Promise<void>
  disabled?: boolean
}) {
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
    await onUpdate(expense.id, { description: nextDescription, amount: nextAmount })
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') e.currentTarget.blur()
    if (e.key === 'Escape') {
      setDescription(expense.description)
      setAmount(formatAmountInput(expense.amount))
      setEditing(false)
      e.currentTarget.blur()
    }
  }

  return (
    <li className="person-expense-row">
      <div className="person-expense-main">
        <div className="person-expense-fields">
          <input
            type="text"
            className="row-edit row-edit-title"
            value={description}
            disabled={disabled}
            aria-label="Descrição"
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setEditing(true)}
            onBlur={() => {
              setEditing(false)
              void commitEdits()
            }}
            onKeyDown={handleKeyDown}
          />
          <span className="row-date">{formatDate(expense.date)}</span>
        </div>
        <input
          type="text"
          inputMode="decimal"
          className="row-edit row-edit-amount"
          value={amount}
          disabled={disabled}
          aria-label="Valor"
          onChange={(e) => setAmount(e.target.value)}
          onFocus={() => setEditing(true)}
          onBlur={() => {
            setEditing(false)
            void commitEdits()
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button
        type="button"
        className="btn-ghost btn-delete"
        disabled={disabled}
        onClick={() => void onRemove(expense.id)}
      >
        Remover
      </button>
    </li>
  )
}

function formatAmountInput(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
