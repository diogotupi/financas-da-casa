import type { CSSProperties } from 'react'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseTable } from './components/ExpenseTable'
import { SettlementCard } from './components/SettlementCard'
import { SyncStatus } from './components/SyncStatus'
import { useExpenses } from './hooks/useExpenses'
import { PEOPLE } from './types'
import './App.css'

function App() {
  const {
    expenses,
    loading,
    synced,
    error,
    addExpense,
    toggleSettled,
    removeExpense,
    updateExpense,
  } = useExpenses()
  const disabled = loading || !!error

  return (
    <div className="app">
      <header className="hero">
        <p className="hero-badge">casa compartilhada</p>
        <h1 className="hero-title">
          <span className="hero-title-line">Finanças</span>
          <span className="hero-title-line hero-title-accent">da Casa</span>
        </h1>
        <p className="hero-sub">Diogo & Camila — meio a meio</p>
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
        <SyncStatus loading={loading} synced={synced} error={error} />
        <SettlementCard expenses={expenses} />
        <ExpenseForm onAdd={addExpense} disabled={disabled} />
        <ExpenseTable
          expenses={expenses}
          onToggleSettled={toggleSettled}
          onRemove={removeExpense}
          onUpdate={updateExpense}
          disabled={disabled}
        />
      </main>

      <footer className="footer">
        <span className="footer-brand">CAPAZ</span>
        <p className="footer-copy">Finanças da casa · Diogo & Camila</p>
      </footer>
    </div>
  )
}

export default App
