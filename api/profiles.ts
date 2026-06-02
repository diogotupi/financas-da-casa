import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors, githubGetJson, githubPutJson } from './lib/github.js'

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
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'Body deve ser um objeto de perfis' })
      }
      await githubPutJson(PATH, body, 'sync: fotos de perfil')
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return res.status(500).json({ error: message })
  }
}
