import { type FormEvent, useState } from 'react'
import { changePassword } from '../lib/auth'
import './ChangePassword.css'

type Feedback = { type: 'error' | 'success'; message: string } | null

export function ChangePassword() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [saving, setSaving] = useState(false)

  function clearFeedback() {
    setFeedback(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    clearFeedback()

    if (next !== confirm) {
      setFeedback({ type: 'error', message: 'A confirmação não coincide com a nova senha.' })
      return
    }

    setSaving(true)
    try {
      await changePassword(current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      setFeedback({
        type: 'success',
        message: 'Senha alterada para todos os dispositivos. Use a nova senha na próxima vez que entrar.',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível alterar a senha.'
      setFeedback({ type: 'error', message })
      if (message.includes('atual incorreta')) setCurrent('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="change-password">
      <details>
        <summary>Alterar senha</summary>
        <form className="change-password-form" onSubmit={(e) => void handleSubmit(e)}>
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
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

          <button type="submit" className="btn-ghost change-password-submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </form>
      </details>
    </section>
  )
}
