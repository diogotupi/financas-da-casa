/**
 * GitHub REST API (token autenticado): 5 000 requisições/hora, reset a cada hora.
 *
 * Cada poll do app chama GET /api/sync → 2 GET no GitHub (expenses + profiles).
 * Orçamento com ~4 abas abertas e 50% de folga para gravações:
 *   5000 × 0,5 / (2 × 4) ≈ 312 polls/h por aba → intervalo mínimo ~12s
 * Usamos 30s para margem confortável.
 */
export const GITHUB_HOURLY_LIMIT = 5_000
export const GITHUB_CALLS_PER_POLL = 2
export const ESTIMATED_CONCURRENT_TABS = 4

export const SYNC_POLL_MS = 30_000
export const SYNC_POLL_MAX_MS = 300_000
