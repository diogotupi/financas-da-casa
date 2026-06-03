import { type FormEvent, useState } from 'react'
import { setPassword, verifyPassword } from '../lib/auth'
import './ChangePassword.css'

type Feedback = { type: 'error' | 'success'; message: string } | null

export function ChangePassword() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)

  function clearFeedback() {
    setFeedback(null)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    clearFeedback()

    if (!verifyPassword(current)) {
      setFeedback({ type: 'error', message: 'Senha atual incorreta.' })
      setCurrent('')
      return
    }

    if (!next.trim()) {
      setFeedback({ type: 'error', message: 'Digite a nova senha.' })
      return
    }

    if (next !== confirm) {
      setFeedback({ type: 'error', message: 'A confirmação não coincide com a nova senha.' })
      return
    }

    if (next === current) {
      setFeedback({ type: 'error', message: 'A nova senha deve ser diferente da atual.' })
      return
    }

    setPassword(next)
    setCurrent('')
    setNext('')
    setConfirm('')
    setFeedback({ type: 'success', message: 'Senha alterada. Use a nova senha na próxima vez que entrar.' })
  }

  return (
    <section className="change-password">
      <details>
        <summary>Alterar senha</summary>
        <form className="change-password-form" onSubmit={handleSubmit}>
          <label className="change-password-field">
            <span>Senha atual</span>
            <input
              type="password"
              value={current}
              onChange={(e) => {
                setCurrent(e.target.value)
                clearFeedback()
              }}
              autoComplete="current-password"
              required
            />
          </label>
          <label className="change-password-field">
            <span>Nova senha</span>
            <input
              type="password"
              value={next}
              onChange={(e) => {
                setNext(e.target.value)
                clearFeedback()
              }}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="change-password-field">
            <span>Confirmar nova senha</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value)
                clearFeedback()
              }}
              autoComplete="new-password"
              required
            />
          </label>

          {feedback && (
            <p
              className={
                feedback.type === 'error' ? 'change-password-error' : 'change-password-success'
              }
              role="alert"
            >
              {feedback.message}
            </p>
          )}

          <button type="submit" className="btn-ghost change-password-submit">
            Salvar nova senha
          </button>
        </form>
      </details>
    </section>
  )
}
