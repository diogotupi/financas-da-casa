import { type FormEvent, useState } from 'react'
import { Avatar } from './Avatar'
import type { Person, Profiles } from '../types'
import { PEOPLE } from '../types'

interface Props {
  onAdd: (data: {
    description: string
    amount: number
    paidBy: Person
    date: string
  }) => Promise<void>
  profiles: Profiles
  disabled?: boolean
}

export function ExpenseForm({ onAdd, profiles, disabled }: Props) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState<Person>('diogo')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(amount.replace(',', '.'))
    if (!description.trim() || !parsed || parsed <= 0 || disabled || saving) return

    setSaving(true)
    try {
      await onAdd({ description, amount: parsed, paidBy, date })
      setDescription('')
      setAmount('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={`expense-form ${disabled ? 'is-disabled' : ''}`} onSubmit={handleSubmit}>
      <h2 className="form-title">
        <span aria-hidden>➕</span> Registrar gasto
      </h2>

      <div className="form-row">
        <label className="field flex-grow">
          <span>O que foi?</span>
          <input
            type="text"
            placeholder="Mercado, luz, internet..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <label className="field field-amount">
          <span>Valor (R$)</span>
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
          <span>Data</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <fieldset className="field payer-field">
          <legend>Quem pagou?</legend>
          <div className="payer-toggle">
            {(['diogo', 'camila'] as const).map((person) => (
              <button
                key={person}
                type="button"
                className={`payer-btn ${paidBy === person ? 'active' : ''}`}
                onClick={() => setPaidBy(person)}
                style={
                  paidBy === person
                    ? {
                        borderColor: PEOPLE[person].color,
                        background: `${PEOPLE[person].color}18`,
                      }
                    : undefined
                }
              >
                <Avatar person={person} photo={profiles[person]} size="small" />
                {PEOPLE[person].name}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <button type="submit" className="btn-primary" disabled={disabled || saving}>
        {saving ? 'Salvando…' : 'Adicionar à planilha'}
      </button>
    </form>
  )
}
