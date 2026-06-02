import type { VercelRequest, VercelResponse } from '@vercel/node'

const REPO = 'diogotupi/financas-da-casa'
const PATH = 'data/expenses.json'

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function getToken() {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN não configurado na Vercel')
  return token
}

async function githubContents(method: string, body?: object) {
  const token = getToken()
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res
}

async function loadExpenses(): Promise<unknown[]> {
  const res = await githubContents('GET')
  if (res.status === 404) return []
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub GET falhou: ${err}`)
  }
  const data = (await res.json()) as { content: string }
  const decoded = Buffer.from(data.content, 'base64').toString('utf8')
  const parsed = JSON.parse(decoded)
  return Array.isArray(parsed) ? parsed : []
}

async function saveExpenses(expenses: unknown[]) {
  let sha: string | undefined
  const existing = await githubContents('GET')
  if (existing.ok) {
    const data = (await existing.json()) as { sha: string }
    sha = data.sha
  }

  const payload = {
    message: 'sync: planilha da casa',
    content: Buffer.from(JSON.stringify(expenses, null, 2)).toString('base64'),
    ...(sha ? { sha } : {}),
  }

  const res = await githubContents('PUT', payload)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub PUT falhou: ${err}`)
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  try {
    if (req.method === 'GET') {
      const data = await loadExpenses()
      return res.status(200).json(data)
    }

    if (req.method === 'PUT') {
      const body = req.body
      if (!Array.isArray(body)) {
        return res.status(400).json({ error: 'Body deve ser um array de gastos' })
      }
      await saveExpenses(body)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return res.status(500).json({ error: message })
  }
}
