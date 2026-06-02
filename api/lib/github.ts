const REPO = 'diogotupi/financas-da-casa'

function getToken() {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN não configurado na Vercel')
  return token
}

export async function githubGetJson(path: string): Promise<unknown> {
  const token = getToken()
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub GET falhou: ${err}`)
  }
  const data = (await res.json()) as { content: string }
  return JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'))
}

export async function githubPutJson(path: string, data: unknown, message: string) {
  const token = getToken()
  const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  let sha: string | undefined
  if (getRes.ok) {
    const existing = (await getRes.json()) as { sha: string }
    sha = existing.sha
  }

  const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
      ...(sha ? { sha } : {}),
    }),
  })

  if (!putRes.ok) {
    const err = await putRes.text()
    throw new Error(`GitHub PUT falhou: ${err}`)
  }
}

export function cors(res: { setHeader: (k: string, v: string) => void }) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}
