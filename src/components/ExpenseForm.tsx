import { type FormEvent, useState } from 'react'
import type { Person } from '../types'
import { PEOPLE } from '../types'

interface Props {
  onAdd: (data: {
    description: string
    amount: number
    paidBy: Person
    date: string
  }) => void
}

export function ExpenseForm({ onAdd }: Props) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState<Person>('diogo')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(amount.replace(',', '.'))
    if (!description.trim() || !parsed || parsed <= 0) return

    onAdd({ description, amount: parsed, paidBy, date })
    setDescription('')
    setAmount('')
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
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
                    ? { borderColor: PEOPLE[person].color, background: `${PEOPLE[person].color}18` }
                    : undefined
                }
              >
                <span
                  className="avatar small"
                  style={{ background: PEOPLE[person].color }}
                >
                  {PEOPLE[person].initial}
                </span>
                {PEOPLE[person].name}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <button type="submit" className="btn-primary">
        Adicionar à planilha
      </button>
    </form>
  )
}
