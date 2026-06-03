import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors, githubGetJson } from './lib/github.js'

/** Uma ida do navegador → expenses + profiles (2 GET no GitHub, em paralelo) */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const [expensesRaw, profilesRaw] = await Promise.all([
      githubGetJson('data/expenses.json'),
      githubGetJson('data/profiles.json'),
    ])

    return res.status(200).json({
      expenses: Array.isArray(expensesRaw) ? expensesRaw : [],
      profiles:
        profilesRaw && typeof profilesRaw === 'object' && !Array.isArray(profilesRaw)
          ? profilesRaw
          : {},
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    const rateLimited = message.includes('rate limit')
    return res.status(rateLimited ? 429 : 500).json({ error: message })
  }
}
