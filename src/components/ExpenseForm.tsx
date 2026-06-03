import { type FormEvent, useEffect, useState } from 'react'
import { defaultDateForMonth } from '../lib/expenses'
import type { MonthKey, PaymentMethod, Person, Profiles } from '../types'
import { PAYMENT_METHODS, PEOPLE } from '../types'
import { Avatar } from './Avatar'

interface Props {
  onAdd: (data: {
    description: string
    amount: number
    paidBy: Person
    date: string
    paymentMethod: PaymentMethod
    installments?: number
  }) => Promise<void>
  profiles: Profiles
  monthKey: MonthKey
  currentUser: Person
  disabled?: boolean
}

export function ExpenseForm({ onAdd, profiles, monthKey, currentUser, disabled }: Props) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => defaultDateForMonth(monthKey))
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [installments, setInstallments] = useState('3')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDate(defaultDateForMonth(monthKey))
  }, [monthKey])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(amount.replace(',', '.'))
    if (!description.trim() || !parsed || parsed <= 0 || disabled || saving) return

    let parcelas: number | undefined
    if (paymentMethod === 'credito') {
      const n = parseInt(installments, 10)
      const count = Number.isFinite(n) && n >= 1 ? Math.min(48, Math.floor(n)) : 1
      parcelas = count >= 2 ? count : undefined
    }

    setSaving(true)
    try {
      await onAdd({
        description,
        amount: parsed,
        paidBy: currentUser,
        date,
        paymentMethod,
        installments: parcelas,
      })
      setDescription('')
      setAmount('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={`expense-form ${disabled ? 'is-disabled' : ''}`} onSubmit={handleSubmit}>
      <h2 className="form-title">
        <span aria-hidden>➕</span> Registrar gasto como {PEOPLE[currentUser].name}
      </h2>

      <p className="form-payer-note">
        <Avatar person={currentUser} photo={profiles[currentUser]} size="small" />
        O gasto será registrado no seu nome ({PEOPLE[currentUser].name}).
      </p>

      <div className="form-row">
        <label className="field flex-grow">
          <span>O que foi?</span>
          <input
            type="text"
            placeholder="Mercado, luz, ração..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <label className="field field-amount">
          <span>Valor total (R$)</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="form-row">
        <label className="field">
          <span>Data da compra</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
      </div>

      <fieldset className="field payment-field">
        <legend>Forma de pagamento</legend>
        <div className="payment-toggle">
          {(['pix', 'debito', 'credito'] as const).map((method) => (
            <button
              key={method}
              type="button"
              className={`payment-btn ${paymentMethod === method ? 'active' : ''}`}
              onClick={() => setPaymentMethod(method)}
            >
              {PAYMENT_METHODS[method].label}
            </button>
          ))}
        </div>
      </fieldset>

      {paymentMethod === 'credito' && (
        <label className="field field-installments">
          <span>Parcelas</span>
          <input
            type="number"
            min={1}
            max={48}
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            required
          />
          <p className="field-hint">
            1x: entra só no mês da compra. 2 ou mais: divide o total nos meses seguintes (ex.: 3x de R$
            100 em jun, jul e ago).
          </p>
        </label>
      )}

      <button type="submit" className="btn-primary" disabled={disabled || saving}>
        {saving ? 'Salvando…' : 'Adicionar'}
      </button>
    </form>
  )
}
