import { fetchSyncBundle, isRateLimitError } from './sync'
import { SYNC_POLL_MAX_MS, SYNC_POLL_MS } from './syncConfig'
import type { Expense, Profiles } from '../types'

export type SyncBundle = { expenses: Expense[]; profiles: Profiles }

type Listener = (result: { ok: true; data: SyncBundle } | { ok: false; error: Error }) => void

const listeners = new Set<Listener>()
let pollMs = SYNC_POLL_MS
let timer: ReturnType<typeof setTimeout> | null = null
let inFlight = false

function scheduleNext() {
  if (timer) clearTimeout(timer)
  if (listeners.size === 0) return
  timer = setTimeout(() => void tick(), pollMs)
}

async function tick() {
  if (inFlight || listeners.size === 0) {
    scheduleNext()
    return
  }

  inFlight = true
  try {
    const data = await fetchSyncBundle()
    pollMs = SYNC_POLL_MS
    const payload = { ok: true as const, data }
    listeners.forEach((fn) => fn(payload))
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Erro de sincronização')
    if (isRateLimitError(error)) {
      pollMs = Math.min(pollMs * 2, SYNC_POLL_MAX_MS)
    }
    listeners.forEach((fn) => fn({ ok: false, error }))
  } finally {
    inFlight = false
    scheduleNext()
  }
}

/** Um único loop de polling para toda a app (evita N abas × N hooks) */
export function subscribeSyncPoll(listener: Listener): () => void {
  listeners.add(listener)
  if (listeners.size === 1) {
    void tick()
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && timer) {
      clearTimeout(timer)
      timer = null
      pollMs = SYNC_POLL_MS
    }
  }
}
