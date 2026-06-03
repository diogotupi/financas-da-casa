import { fetchPassword, isSyncConfigured, updatePassword } from './sync'

const AUTH_KEY = 'financas-da-casa-auth'
const PASSWORD_KEY = 'financas-da-casa-password'
const DEFAULT_PASSWORD = 'abc123'

let cachedPassword: string | null = null
let initPromise: Promise<void> | null = null

function passwordFromStorage(): string {
  return localStorage.getItem(PASSWORD_KEY) ?? DEFAULT_PASSWORD
}

function cachePassword(value: string) {
  cachedPassword = value
  localStorage.setItem(PASSWORD_KEY, value)
}

export function getPassword(): string {
  return cachedPassword ?? passwordFromStorage()
}

export function verifyPassword(input: string): boolean {
  return input === getPassword()
}

/** Carrega a senha da API (compartilhada) ou do navegador como fallback */
export function initAuth(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      if (isSyncConfigured) {
        try {
          const remote = await fetchPassword()
          cachePassword(remote)
          return
        } catch {
          // usa cache local abaixo
        }
      }
      cachedPassword = passwordFromStorage()
    })()
  }
  return initPromise
}

export async function changePassword(current: string, next: string): Promise<void> {
  const trimmed = next.trim()
  if (!verifyPassword(current)) {
    throw new Error('Senha atual incorreta.')
  }
  if (!trimmed) {
    throw new Error('Digite a nova senha.')
  }
  if (trimmed === current) {
    throw new Error('A nova senha deve ser diferente da atual.')
  }

  if (isSyncConfigured) {
    await updatePassword(current, trimmed)
  }

  cachePassword(trimmed)

  // Confirma que ficou gravado (API ou local)
  if (getPassword() !== trimmed) {
    throw new Error('Não foi possível salvar a senha. Tente de novo.')
  }
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}

export function setAuthenticated(): void {
  sessionStorage.setItem(AUTH_KEY, '1')
}
