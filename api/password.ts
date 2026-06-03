import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors, githubGetJson, githubPutJson } from './lib/github.js'

const PATH = 'data/password.json'
const DEFAULT_PASSWORD = 'abc123'

function readPassword(data: unknown): string {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const p = (data as { password?: unknown }).password
    if (typeof p === 'string' && p.length > 0) return p
  }
  return DEFAULT_PASSWORD
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  try {
    if (req.method === 'GET') {
      const data = await githubGetJson(PATH)
      return res.status(200).json({ password: readPassword(data) })
    }

    if (req.method === 'PUT') {
      const body = req.body
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'Body inválido' })
      }
      const currentPassword = (body as { currentPassword?: unknown }).currentPassword
      const newPassword = (body as { newPassword?: unknown }).newPassword
      if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
        return res.status(400).json({ error: 'currentPassword e newPassword são obrigatórios' })
      }
      const trimmed = newPassword.trim()
      if (!trimmed) {
        return res.status(400).json({ error: 'Nova senha inválida' })
      }
      if (trimmed === currentPassword) {
        return res.status(400).json({ error: 'A nova senha deve ser diferente da atual' })
      }

      const stored = readPassword(await githubGetJson(PATH))
      if (currentPassword !== stored) {
        return res.status(403).json({ error: 'Senha atual incorreta' })
      }

      await githubPutJson(PATH, { password: trimmed }, 'sync: senha do site')
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return res.status(500).json({ error: message })
  }
}
