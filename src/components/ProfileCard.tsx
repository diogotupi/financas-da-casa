import { useEffect, useRef, useState } from 'react'
import type { Person } from '../types'
import { PEOPLE } from '../types'
import { Avatar } from './Avatar'
import { ImageCropModal } from './ImageCropModal'

interface Props {
  person: Person
  photo?: string
  uploading?: Person | null
  disabled?: boolean
  canEdit?: boolean
  onUpload: (person: Person, dataUrl: string) => Promise<void>
}

export function ProfileCard({
  person,
  photo,
  uploading,
  disabled,
  canEdit = true,
  onUpload,
}: Props) {
  const locked = disabled || !canEdit
  const inputRef = useRef<HTMLInputElement>(null)
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)
  const info = PEOPLE[person]

  useEffect(() => {
    return () => {
      if (cropImageUrl) URL.revokeObjectURL(cropImageUrl)
    }
  }, [cropImageUrl])

  function openFilePicker() {
    inputRef.current?.click()
  }

  function handleFileSelect(file: File | undefined) {
    if (!file || locked || uploading) return
    if (!file.type.startsWith('image/')) return

    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl)
    setCropImageUrl(URL.createObjectURL(file))
  }

  function closeCrop() {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl)
    setCropImageUrl(null)
  }

  async function handleCropConfirm(dataUrl: string) {
    closeCrop()
    await onUpload(person, dataUrl)
  }

  return (
    <>
      <div className="hero-person">
        <button
          type="button"
          className="profile-avatar-btn"
          disabled={locked || !!uploading}
          onClick={openFilePicker}
          aria-label={canEdit ? `Trocar foto de ${info.name}` : `Foto de ${info.name}`}
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
            handleFileSelect(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        <span>{info.name}</span>
        {canEdit && (
          <button
            type="button"
            className="profile-upload-label"
            disabled={locked || !!uploading}
            onClick={openFilePicker}
          >
            {uploading === person ? 'Enviando…' : photo ? 'Trocar foto' : 'Enviar foto'}
          </button>
        )}
      </div>

      {cropImageUrl && (
        <ImageCropModal
          imageUrl={cropImageUrl}
          personName={info.name}
          onConfirm={handleCropConfirm}
          onCancel={closeCrop}
        />
      )}
    </>
  )
}
