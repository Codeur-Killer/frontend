import { http, setToken } from './httpClient'

export async function login(email, password) {
  try {
    const { token, user } = await http.post('/auth/login', { email, password })
    setToken(token)
    return { ok: true, user }
  } catch (err) {
    return { ok: false, message: err.message }
  }
}

export async function me() {
  const { user } = await http.get('/auth/me')
  return user
}

export async function changePassword(currentPassword, newPassword) {
  const { user } = await http.patch('/auth/me/password', { currentPassword, newPassword })
  return user
}
