import type { SyncState } from '../hooks/useExpenses'

interface Props {
  loading: boolean
  synced: boolean
  syncState: SyncState
  error: string | null
}

export function SyncStatus({ loading, synced, syncState, error }: Props) {
  if (error === 'sync-not-configured') {
    return (
      <div className="sync-banner sync-warning" role="status">
        <span aria-hidden>⚠️</span>
        <span>Sincronização em nuvem não configurada neste build.</span>
      </div>
    )
  }

  if (syncState === 'stale' && error) {
    return (
      <div className="sync-banner sync-warning" role="alert">
        <span aria-hidden>⚠️</span>
        <span>{error}</span>
      </div>
    )
  }

  if (syncState === 'error' && error) {
    return (
      <div className="sync-banner sync-error" role="alert">
        <span aria-hidden>❌</span>
        <span>Erro de sincronização: {error}</span>
      </div>
    )
  }

  if (loading && !synced) {
    return (
      <div className="sync-banner sync-loading" role="status">
        <span className="sync-dot pulse" aria-hidden />
        <span>Conectando à planilha compartilhada…</span>
      </div>
    )
  }

  if (synced) {
    return (
      <div className="sync-banner sync-ok" role="status">
        <span className="sync-dot live" aria-hidden />
        <span>Sincronizado em tempo real — Diogo e Camila veem a mesma planilha</span>
      </div>
    )
  }

  return null
}
