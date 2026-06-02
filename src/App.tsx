import type { CSSProperties } from 'react'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseTable } from './components/ExpenseTable'
import { SettlementCard } from './components/SettlementCard'
import { useExpenses } from './hooks/useExpenses'
import { PEOPLE } from './types'
import './App.css'

function App() {
  const { expenses, addExpense, toggleSettled, removeExpense } = useExpenses()

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-badge">nosso cantinho</div>
        <h1>Finanças da Casa</h1>
        <p className="hero-sub">
          Diogo & Camila — dividindo tudo meio a meio, sem stress
        </p>
        <div className="hero-avatars">
          {(['diogo', 'camila'] as const).map((p) => (
            <div
              key={p}
              className="hero-person"
              style={{ '--person-color': PEOPLE[p].color } as CSSProperties}
            >
              <span className="avatar large" style={{ background: PEOPLE[p].color }}>
                {PEOPLE[p].initial}
              </span>
              <span>{PEOPLE[p].name}</span>
            </div>
          ))}
        </div>
      </header>

      <main>
        <SettlementCard expenses={expenses} />
        <ExpenseForm onAdd={addExpense} />
        <ExpenseTable
          expenses={expenses}
          onToggleSettled={toggleSettled}
          onRemove={removeExpense}
        />
      </main>

      <footer className="footer">
        <p>Feito com carinho pra nossa casa 🏡</p>
      </footer>
    </div>
  )
}

export default App
