import type { VercelResponse } from '@vercel/node'

export function isSiteOffline(): boolean {
  return process.env.SITE_OFFLINE === '1' || process.env.SITE_OFFLINE === 'true'
}

export function offlineResponse(res: VercelResponse): boolean {
  if (!isSiteOffline()) return false
  res.status(503).json({ error: 'Site temporariamente fora do ar' })
  return true
}
