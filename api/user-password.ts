import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors, githubPutJson } from './lib/github.js'
import { offlineResponse } from './lib/offline.js'
import {
  isHouseUser,
  loadUserPasswords,
  verifyUserPassword,
  type HouseUser,
} from './lib/users.js'

const USERS_PATH = 'data/users.json'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (offlineResponse(res)) return

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const body = req.body
    const user = body?.user
    const currentPassword = body?.currentPassword
    const newPassword = body?.newPassword

    if (!isHouseUser(user) || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'user, currentPassword e newPassword são obrigatórios' })
    }

    const trimmed = newPassword.trim()
    if (!trimmed) {
      return res.status(400).json({ error: 'Nova senha inválida' })
    }
    if (trimmed === currentPassword) {
      return res.status(400).json({ error: 'A nova senha deve ser diferente da atual' })
    }

    const users = await loadUserPasswords()
    if (!verifyUserPassword(users, user, currentPassword)) {
      return res.status(403).json({ error: 'Senha atual incorreta' })
    }

    const next: Record<HouseUser, string> = { ...users, [user]: trimmed }
    await githubPutJson(USERS_PATH, next, `sync: senha de ${user}`)
    return res.status(200).json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return res.status(500).json({ error: message })
  }
}
