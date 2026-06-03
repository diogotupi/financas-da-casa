import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
  formatDate,
  formatMonthLabel,
  getMonthlyEntriesForMonth,
  type MonthlyEntry,
} from '../lib/expenses'
import type { Expense, MonthKey, Person } from '../types'
import { PAYMENT_METHODS, PEOPLE } from '../types'

interface Props {
  person: Person
  expenses: Expense[]
  monthKey: MonthKey
  onRemove: (id: string) => Promise<void>
  onUpdate: (
    id: string,
    patch: { description?: string; amount?: number },
    options?: { fromInstallmentSlice?: boolean },
  ) => Promise<void>
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
  const list = getMonthlyEntriesForMonth(expenses, monthKey, person)
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
          {list.map((entry) => (
            <ExpenseRow
              key={`${entry.expenseId}-${entry.installment?.current ?? 'full'}`}
              entry={entry}
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
  entry,
  onRemove,
  onUpdate,
  disabled,
}: {
  entry: MonthlyEntry
  onRemove: (id: string) => Promise<void>
  onUpdate: (
    id: string,
    patch: { description?: string; amount?: number },
    options?: { fromInstallmentSlice?: boolean },
  ) => Promise<void>
  disabled?: boolean
}) {
  const [label, setLabel] = useState(entry.label)
  const [amount, setAmount] = useState(formatAmountInput(entry.amount))
  const [editing, setEditing] = useState(false)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const isSlice = Boolean(entry.installment)

  useEffect(() => {
    if (!editing) {
      setLabel(entry.label)
      setAmount(formatAmountInput(entry.amount))
    }
  }, [entry.label, entry.amount, editing])

  useLayoutEffect(() => {
    resizeDescription(descriptionRef.current)
  }, [label])

  async function commitEdits() {
    const nextLabel = label.trim()
    const nextAmount = parseAmount(amount)
    if (!nextLabel || !nextAmount || nextAmount <= 0) {
      setLabel(entry.label)
      setAmount(formatAmountInput(entry.amount))
      return
    }
    await onUpdate(
      entry.expenseId,
      { description: nextLabel, amount: nextAmount },
      { fromInstallmentSlice: isSlice },
    )
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') e.currentTarget.blur()
    if (e.key === 'Escape') {
      setLabel(entry.label)
      setAmount(formatAmountInput(entry.amount))
      setEditing(false)
      e.currentTarget.blur()
    }
  }

  function resizeDescription(el: HTMLTextAreaElement | null) {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <li className={`person-expense-row ${isSlice ? 'is-installment' : ''}`}>
      <div className="person-expense-main">
        <textarea
          className="row-edit row-edit-title"
          rows={1}
          value={label}
          disabled={disabled}
          aria-label="Descrição"
          onChange={(e) => {
            setLabel(e.target.value)
            resizeDescription(e.target)
          }}
          onFocus={(e) => {
            setEditing(true)
            resizeDescription(e.currentTarget)
          }}
          onBlur={(e) => {
            setEditing(false)
            resizeDescription(e.target)
            void commitEdits()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              e.currentTarget.blur()
            }
            if (e.key === 'Escape') {
              setLabel(entry.label)
              setAmount(formatAmountInput(entry.amount))
              setEditing(false)
              e.currentTarget.blur()
            }
          }}
          ref={descriptionRef}
        />
        <div className="person-expense-bottom">
          <div className="row-meta-line">
            <span className={`payment-badge payment-badge--${entry.paymentMethod}`}>
              {PAYMENT_METHODS[entry.paymentMethod].label}
            </span>
            <span className="row-date">
              {isSlice ? `Compra em ${formatDate(entry.purchaseDate)}` : formatDate(entry.purchaseDate)}
            </span>
          </div>
          <input
            type="text"
            inputMode="decimal"
            className="row-edit row-edit-amount"
            value={amount}
            disabled={disabled}
            aria-label={isSlice ? 'Valor da parcela' : 'Valor'}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={() => setEditing(true)}
            onBlur={() => {
              setEditing(false)
              void commitEdits()
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      <button
        type="button"
        className="btn-ghost btn-delete"
        disabled={disabled}
        onClick={() => void onRemove(entry.expenseId)}
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
