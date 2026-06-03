import { type FormEvent, useEffect, useState } from 'react'
import { initAuth, isAuthenticated, setAuthenticated, verifyPassword } from '../lib/auth'
import './PasswordGate.css'

interface Props {
  children: React.ReactNode
}

export function PasswordGate({ children }: Props) {
  const [ready, setReady] = useState(false)
  const [unlocked, setUnlocked] = useState(isAuthenticated)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    void initAuth().then(() => setReady(true))
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (verifyPassword(password)) {
      setAuthenticated()
      setUnlocked(true)
      setError(false)
      return
    }
    setError(true)
    setPassword('')
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
        <p className="password-hint">Digite a senha para entrar</p>

        <form onSubmit={handleSubmit}>
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
            />
          </label>

          {error && (
            <p className="password-error" role="alert">
              Senha incorreta. Tente de novo.
            </p>
          )}

          <button type="submit" className="password-submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
