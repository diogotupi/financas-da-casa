const AUTH_KEY = 'financas-da-casa-auth'
const PASSWORD_KEY = 'financas-da-casa-password'
const DEFAULT_PASSWORD = 'abc123'

export function getPassword(): string {
  return localStorage.getItem(PASSWORD_KEY) ?? DEFAULT_PASSWORD
}

export function verifyPassword(input: string): boolean {
  return input === getPassword()
}

export function setPassword(next: string): void {
  localStorage.setItem(PASSWORD_KEY, next)
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}

export function setAuthenticated(): void {
  sessionStorage.setItem(AUTH_KEY, '1')
}
