import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { processProfileImage } from '../lib/image'
import './ImageCropModal.css'

interface Props {
  imageUrl: string
  personName: string
  onConfirm: (dataUrl: string) => Promise<void>
  onCancel: () => void
}

export function ImageCropModal({
  imageUrl,
  personName,
  onConfirm,
  onCancel,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels || saving) return
    setSaving(true)
    setError(null)
    try {
      const dataUrl = await processProfileImage(imageUrl, croppedAreaPixels)
      await onConfirm(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar a foto')
      setSaving(false)
    }
  }

  return (
    <div className="crop-backdrop" role="dialog" aria-modal="true" aria-labelledby="crop-title">
      <div className="crop-dialog">
        <h2 id="crop-title" className="crop-title">
          Ajustar foto — {personName}
        </h2>
        <p className="crop-hint">Arraste e use o zoom para enquadrar como quiser</p>

        <div className="crop-area">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <label className="crop-zoom-label">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>

        {error && (
          <p className="crop-error" role="alert">
            {error}
          </p>
        )}

        <div className="crop-actions">
          <button type="button" className="crop-btn crop-btn-cancel" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button
            type="button"
            className="crop-btn crop-btn-confirm"
            onClick={() => void handleConfirm()}
            disabled={saving || !croppedAreaPixels}
          >
            {saving ? 'Salvando…' : 'Usar esta foto'}
          </button>
        </div>
      </div>
    </div>
  )
}
