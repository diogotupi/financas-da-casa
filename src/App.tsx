import { useMemo, useState } from 'react'
import { ChangePassword } from './components/ChangePassword'
import { ExpenseForm } from './components/ExpenseForm'
import { MonthlyView } from './components/MonthlyView'
import { ProfileCard } from './components/ProfileCard'
import { LogoutButton } from './components/PasswordGate'
import { SyncStatus } from './components/SyncStatus'
import { getCurrentUser } from './lib/auth'
import { useExpenses } from './hooks/useExpenses'
import { useProfiles } from './hooks/useProfiles'
import { currentMonthKey, getAvailableMonths } from './lib/expenses'
import { PEOPLE } from './types'
import type { MonthKey } from './types'
import './App.css'

function App() {
  const currentUser = getCurrentUser()!
  const {
    expenses,
    loading,
    synced,
    syncState,
    error,
    addExpense,
    removeExpense,
    updateExpense,
  } = useExpenses()
  const { profiles, uploading, uploadPhoto } = useProfiles()
  const disabled = loading && expenses.length === 0

  const availableMonths = useMemo(() => getAvailableMonths(expenses), [expenses])
  const [monthKey, setMonthKey] = useState<MonthKey>(currentMonthKey)

  const activeMonth = availableMonths.includes(monthKey) ? monthKey : availableMonths[0]

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-top">
          <div className="hero-badge">nosso cantinho</div>
          <LogoutButton />
        </div>
        <h1>Finanças da Casa</h1>
        <p className="hero-sub">
          Olá, {PEOPLE[currentUser].name}. Seja bem vindo ao controle financeiro da sua casa.
        </p>
        <div className="hero-avatars">
          {(['diogo', 'camila'] as const).map((person) => (
            <ProfileCard
              key={person}
              person={person}
              photo={profiles[person]}
              uploading={uploading}
              disabled={disabled}
              canEdit={currentUser === person}
              onUpload={uploadPhoto}
            />
          ))}
        </div>
      </header>

      <main>
        <SyncStatus loading={loading} synced={synced} syncState={syncState} error={error} />
        <ExpenseForm
          onAdd={addExpense}
          profiles={profiles}
          monthKey={activeMonth}
          currentUser={currentUser}
          disabled={disabled}
        />
        <MonthlyView
          expenses={expenses}
          monthKey={activeMonth}
          onMonthChange={setMonthKey}
          profiles={profiles}
          currentUser={currentUser}
          onRemove={removeExpense}
          onUpdate={updateExpense}
          disabled={disabled}
        />
      </main>

      <ChangePassword currentUser={currentUser} />

      <footer className="footer">
        <p>Feito com carinho pra nossa casa 🏡</p>
      </footer>
    </div>
  )
}

export default App
