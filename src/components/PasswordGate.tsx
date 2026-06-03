import { type FormEvent, useEffect, useState } from 'react'
import { initAuth, login, logout } from '../lib/auth'
import type { Person } from '../types'
import { PEOPLE } from '../types'
import './PasswordGate.css'

interface Props {
  children: React.ReactNode
}

export function PasswordGate({ children }: Props) {
  const [ready, setReady] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [user, setUser] = useState<Person>('diogo')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void initAuth().then((ok) => {
      setUnlocked(ok)
      setReady(true)
    })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(false)
    try {
      await login(user, password)
      setUnlocked(true)
      setPassword('')
    } catch (err) {
      setError(true)
      setPassword('')
      if (err instanceof Error && !err.message.includes('incorretos')) {
        console.warn('Login:', err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready) {
    return (
      <div className="password-gate">
        <div className="password-card">
          <p className="password-hint">Carregando…</p>
        </div>
      </div>
    )
  }

  if (unlocked) return children

  return (
    <div className="password-gate">
      <div className="password-card">
        <p className="password-badge">nosso cantinho</p>
        <h1>Finanças da Casa</h1>
        <p className="password-hint">Entre com seu usuário e senha</p>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <fieldset className="password-user-field">
            <legend>Usuário</legend>
            <div className="password-user-toggle">
              {(['diogo', 'camila'] as const).map((person) => (
                <button
                  key={person}
                  type="button"
                  className={`password-user-btn ${user === person ? 'active' : ''}`}
                  onClick={() => {
                    setUser(person)
                    setError(false)
                  }}
                  style={
                    user === person
                      ? {
                          borderColor: PEOPLE[person].color,
                          background: `${PEOPLE[person].color}18`,
                        }
                      : undefined
                  }
                >
                  {PEOPLE[person].name}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="password-field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="••••••"
              autoFocus
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="password-error" role="alert">
              Usuário ou senha incorretos. Se acabou de mudar a senha, use a nova. Padrão inicial:
              abc123 para ambos.
            </p>
          )}

          <button type="submit" className="password-submit" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn-ghost btn-logout"
      onClick={() => {
        void logout()
        window.location.reload()
      }}
    >
      Sair
    </button>
  )
}
