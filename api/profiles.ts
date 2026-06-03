import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors, githubGetJson, githubPutJson } from './lib/github.js'
import { isHouseUser, loadUserPasswords, verifyUserPassword } from './lib/users.js'

const PATH = 'data/profiles.json'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  try {
    if (req.method === 'GET') {
      const data = await githubGetJson(PATH)
      return res.status(200).json(data ?? {})
    }

    if (req.method === 'PUT') {
      const body = req.body
      const user = body?.user
      const password = body?.password
      const profiles = body?.profiles

      if (!isHouseUser(user) || typeof password !== 'string') {
        return res.status(400).json({ error: 'Envie user, password e profiles' })
      }
      if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) {
        return res.status(400).json({ error: 'profiles deve ser um objeto' })
      }

      const users = await loadUserPasswords()
      if (!verifyUserPassword(users, user, password)) {
        return res.status(403).json({ error: 'Usuário ou senha incorretos' })
      }

      const existing = await githubGetJson(PATH)
      const current =
        existing && typeof existing === 'object' && !Array.isArray(existing)
          ? (existing as Record<string, unknown>)
          : {}

      const next: Record<string, unknown> = { ...current }
      const ownPhoto = (profiles as Record<string, unknown>)[user]
      if (ownPhoto !== undefined) {
        next[user] = ownPhoto
      }

      if (
        (['diogo', 'camila'] as const).some((p) => {
          if (p === user) return false
          const a = current[p]
          const b = (profiles as Record<string, unknown>)[p]
          return b !== undefined && JSON.stringify(a) !== JSON.stringify(b)
        })
      ) {
        return res.status(403).json({ error: 'Só pode alterar sua própria foto' })
      }

      await githubPutJson(PATH, next, `sync: foto de ${user}`)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return res.status(500).json({ error: message })
  }
}
