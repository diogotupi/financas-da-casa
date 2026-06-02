import { type FormEvent, useState } from 'react'
import './PasswordGate.css'

const AUTH_KEY = 'financas-da-casa-auth'
const PASSWORD = 'abc123'

function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}

interface Props {
  children: React.ReactNode
}

export function PasswordGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(isAuthenticated)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password === PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1')
      setUnlocked(true)
      setError(false)
      return
    }
    setError(true)
    setPassword('')
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
