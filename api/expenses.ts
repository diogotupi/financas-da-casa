import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors, githubGetJson, githubPutJson } from './lib/github.js'
import { mergeExpensesForUser } from './lib/mergeExpenses.js'
import { offlineResponse } from './lib/offline.js'
import { isHouseUser, loadUserPasswords, verifyUserPassword } from './lib/users.js'

const PATH = 'data/expenses.json'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (offlineResponse(res)) return

  try {
    if (req.method === 'GET') {
      const data = await githubGetJson(PATH)
      return res.status(200).json(Array.isArray(data) ? data : [])
    }

    if (req.method === 'PUT') {
      const body = req.body
      const user = body?.user
      const password = body?.password
      const expenses = body?.expenses

      if (!isHouseUser(user) || typeof password !== 'string' || !Array.isArray(expenses)) {
        return res.status(400).json({
          error: 'Envie user, password e expenses (array)',
        })
      }

      const users = await loadUserPasswords()
      if (!verifyUserPassword(users, user, password)) {
        return res.status(403).json({ error: 'Usuário ou senha incorretos' })
      }

      const existing = await githubGetJson(PATH)
      const current = Array.isArray(existing) ? existing : []

      let merged
      try {
        merged = mergeExpensesForUser(current, expenses, user)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Alteração não permitida'
        return res.status(403).json({ error: message })
      }

      await githubPutJson(PATH, merged, `sync: planilha (${user})`)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return res.status(500).json({ error: message })
  }
}
