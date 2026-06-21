import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors } from './lib/github.js'
import { offlineResponse } from './lib/offline.js'
import { loadUserPasswords, verifyUserPassword } from './lib/users.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (offlineResponse(res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const body = req.body
    const user = body?.user
    const password = body?.password
    const users = await loadUserPasswords()

    if (!verifyUserPassword(users, user, password)) {
      return res.status(403).json({ error: 'Usuário ou senha incorretos' })
    }

    return res.status(200).json({ ok: true, user })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return res.status(500).json({ error: message })
  }
}
