import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseTable } from './components/ExpenseTable'
import { ProfileCard } from './components/ProfileCard'
import { SettlementCard } from './components/SettlementCard'
import { SyncStatus } from './components/SyncStatus'
import { useExpenses } from './hooks/useExpenses'
import { useProfiles } from './hooks/useProfiles'
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
  const { profiles, uploading, uploadPhoto } = useProfiles()
  const disabled = loading || !!error

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-badge">nosso cantinho</div>
        <h1>Finanças da Casa</h1>
        <p className="hero-sub">
          Diogo & Camila — dividindo tudo meio a meio, sem stress
        </p>
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
        <SettlementCard expenses={expenses} profiles={profiles} />
        <ExpenseForm onAdd={addExpense} profiles={profiles} disabled={disabled} />
        <ExpenseTable
          expenses={expenses}
          onToggleSettled={toggleSettled}
          onRemove={removeExpense}
          onUpdate={updateExpense}
          profiles={profiles}
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
