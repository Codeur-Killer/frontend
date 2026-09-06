const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4010/api'
const TOKEN_KEY = 'gugp_token_v1'

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token)
    // Set cookie for server-side authentication
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Strict; Secure`
  } else {
    window.localStorage.removeItem(TOKEN_KEY)
    // Remove cookie
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Strict; Secure`
  }
}

export function getTokenFromCookie() {
  const match = document.cookie.match(new RegExp('(^| )' + TOKEN_KEY + '=([^;]+)'))
  return match ? match[2] : null
}

async function request(path, { method = 'GET', body } = {}) {
  const token = getTokenFromCookie() || getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || `Erreur réseau (${res.status})`)
  }
  return data
}

export const http = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
