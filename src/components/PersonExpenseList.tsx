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
  canEdit: boolean
  onRemove: (id: string) => Promise<void>
  onUpdate: (
    id: string,
    patch: { description?: string; amount?: number; date?: string },
    options?: { fromInstallmentSlice?: boolean },
  ) => Promise<void>
  disabled?: boolean
}

export function PersonExpenseList({
  person,
  expenses,
  monthKey,
  canEdit,
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
          {!canEdit ? ' · só leitura' : ''}
        </span>
      </header>

      {list.length === 0 ? (
        <p className="person-month-empty">Nenhum gasto neste mês.</p>
      ) : (
        <div className="person-month-scroll">
          <ul className="person-month-list">
            {list.map((entry) => (
              <ExpenseRow
                key={`${entry.expenseId}-${entry.installment?.current ?? 'full'}`}
                entry={entry}
                canEdit={canEdit}
                onRemove={onRemove}
                onUpdate={onUpdate}
                disabled={disabled}
              />
            ))}
          </ul>
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
  entry,
  canEdit,
  onRemove,
  onUpdate,
  disabled,
}: {
  entry: MonthlyEntry
  canEdit: boolean
  onRemove: (id: string) => Promise<void>
  onUpdate: (
    id: string,
    patch: { description?: string; amount?: number; date?: string },
    options?: { fromInstallmentSlice?: boolean },
  ) => Promise<void>
  disabled?: boolean
}) {
  const readOnly = disabled || !canEdit
  const [label, setLabel] = useState(entry.label)
  const [amount, setAmount] = useState(formatAmountInput(entry.amount))
  const [date, setDate] = useState(toDateInputValue(entry.purchaseDate))
  const [editing, setEditing] = useState(false)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const isSlice = Boolean(entry.installment)

  useEffect(() => {
    if (!editing) {
      setLabel(entry.label)
      setAmount(formatAmountInput(entry.amount))
      setDate(toDateInputValue(entry.purchaseDate))
    }
  }, [entry.label, entry.amount, entry.purchaseDate, editing])

  useLayoutEffect(() => {
    resizeDescription(descriptionRef.current)
  }, [label])

  async function commitEdits() {
    const nextLabel = label.trim()
    const nextAmount = parseAmount(amount)
    if (!nextLabel || !nextAmount || nextAmount <= 0 || !date) {
      setLabel(entry.label)
      setAmount(formatAmountInput(entry.amount))
      setDate(toDateInputValue(entry.purchaseDate))
      return
    }
    await onUpdate(
      entry.expenseId,
      { description: nextLabel, amount: nextAmount, date },
      { fromInstallmentSlice: isSlice },
    )
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') e.currentTarget.blur()
    if (e.key === 'Escape') {
      setLabel(entry.label)
      setAmount(formatAmountInput(entry.amount))
      setDate(toDateInputValue(entry.purchaseDate))
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
    <li
      className={`person-expense-row ${isSlice ? 'is-installment' : ''} ${readOnly ? 'is-readonly' : ''}`}
    >
      <div className="person-expense-main">
        <textarea
          className="row-edit row-edit-title"
          rows={1}
          value={label}
          disabled={readOnly}
          aria-label="Descrição"
          readOnly={readOnly}
          onChange={(e) => {
            setLabel(e.target.value)
            resizeDescription(e.target)
          }}
          onFocus={(e) => {
            if (readOnly) return
            setEditing(true)
            resizeDescription(e.currentTarget)
          }}
          onBlur={(e) => {
            if (readOnly) return
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
            {readOnly ? (
              <span className="row-date">
                {isSlice
                  ? `Compra em ${formatDate(entry.purchaseDate)}`
                  : formatDate(entry.purchaseDate)}
              </span>
            ) : (
              <label className="row-date-edit">
                {isSlice && <span className="row-date-prefix">Compra em</span>}
                <input
                  type="date"
                  className="row-edit row-edit-date"
                  value={date}
                  aria-label={isSlice ? 'Data da compra' : 'Data'}
                  onChange={(e) => {
                    setDate(e.target.value)
                    setEditing(true)
                  }}
                  onBlur={() => {
                    setEditing(false)
                    void commitEdits()
                  }}
                />
              </label>
            )}
          </div>
          <input
            type="text"
            inputMode="decimal"
            className="row-edit row-edit-amount"
            value={amount}
            disabled={readOnly}
            readOnly={readOnly}
            aria-label={isSlice ? 'Valor da parcela' : 'Valor'}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={() => {
              if (!readOnly) setEditing(true)
            }}
            onBlur={() => {
              if (readOnly) return
              setEditing(false)
              void commitEdits()
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      {canEdit && !disabled && (
        <button
          type="button"
          className="btn-ghost btn-delete"
          onClick={() => void onRemove(entry.expenseId)}
        >
          Remover
        </button>
      )}
    </li>
  )
}

function formatAmountInput(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function toDateInputValue(iso: string) {
  return iso.slice(0, 10)
}
