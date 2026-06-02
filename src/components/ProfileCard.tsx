import { useRef } from 'react'
import type { Person } from '../types'
import { PEOPLE } from '../types'
import { Avatar } from './Avatar'

interface Props {
  person: Person
  photo?: string
  uploading?: Person | null
  disabled?: boolean
  onUpload: (person: Person, file: File) => Promise<void>
}

export function ProfileCard({
  person,
  photo,
  uploading,
  disabled,
  onUpload,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const info = PEOPLE[person]

  async function handleFile(file: File | undefined) {
    if (!file || disabled || uploading) return
    await onUpload(person, file)
  }

  return (
    <div className="hero-person">
      <button
        type="button"
        className="profile-avatar-btn"
        disabled={disabled || !!uploading}
        onClick={() => inputRef.current?.click()}
        aria-label={`Trocar foto de ${info.name}`}
      >
        <Avatar person={person} photo={photo} size="large" />
        <span className="profile-avatar-overlay">
          {uploading === person ? '…' : '📷'}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="profile-file-input"
        onChange={(e) => {
          const file = e.target.files?.[0]
          void handleFile(file)
          e.target.value = ''
        }}
      />

      <span>{info.name}</span>
      <button
        type="button"
        className="profile-upload-label"
        disabled={disabled || !!uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading === person ? 'Enviando…' : photo ? 'Trocar foto' : 'Enviar foto'}
      </button>
    </div>
  )
}
