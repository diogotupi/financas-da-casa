import { useMemo, useState } from 'react'
import { ExpenseForm } from './components/ExpenseForm'
import { MonthlyView } from './components/MonthlyView'
import { ProfileCard } from './components/ProfileCard'
import { SyncStatus } from './components/SyncStatus'
import { useExpenses } from './hooks/useExpenses'
import { useProfiles } from './hooks/useProfiles'
import { currentMonthKey, getAvailableMonths } from './lib/expenses'
import type { MonthKey } from './types'
import './App.css'

function App() {
  const { expenses, loading, synced, error, addExpense, removeExpense, updateExpense } =
    useExpenses()
  const { profiles, uploading, uploadPhoto } = useProfiles()
  const disabled = loading || !!error

  const availableMonths = useMemo(() => getAvailableMonths(expenses), [expenses])
  const [monthKey, setMonthKey] = useState<MonthKey>(currentMonthKey)

  const activeMonth = availableMonths.includes(monthKey) ? monthKey : availableMonths[0]

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-badge">nosso cantinho</div>
        <h1>Finanças da Casa</h1>
        <p className="hero-sub">Diogo & Camila — gastos mês a mês</p>
        <div className="hero-avatars">
          {(['diogo', 'camila'] as const).map((person) => (
            <ProfileCard
              key={person}
              person={person}
              photo={profiles[person]}
              uploading={uploading}
              disabled={disabled}
              onUpload={uploadPhoto}
            />
          ))}
        </div>
      </header>

      <main>
        <SyncStatus loading={loading} synced={synced} error={error} />
        <ExpenseForm
          onAdd={addExpense}
          profiles={profiles}
          monthKey={activeMonth}
          disabled={disabled}
        />
        <MonthlyView
          expenses={expenses}
          monthKey={activeMonth}
          onMonthChange={setMonthKey}
          profiles={profiles}
          onRemove={removeExpense}
          onUpdate={updateExpense}
          disabled={disabled}
        />
      </main>

      <footer className="footer">
        <p>Feito com carinho pra nossa casa 🏡</p>
      </footer>
    </div>
  )
}

export default App
