interface Props {
  loading: boolean
  synced: boolean
  error: string | null
}

export function SyncStatus({ loading, synced, error }: Props) {
  if (error === 'sync-not-configured') {
    return (
      <div className="sync-banner sync-warning" role="status">
        <span aria-hidden>⚠️</span>
        <span>Sincronização em nuvem não configurada neste build.</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sync-banner sync-error" role="alert">
        <span aria-hidden>❌</span>
        <span>Erro de sincronização: {error}</span>
      </div>
    )
  }

  if (loading) {
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
        <span>Sincronizado — vocês dois veem a mesma planilha ao vivo</span>
      </div>
    )
  }

  return null
}
