import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/authApi'
import { getToken, setToken, getTokenFromCookie } from '../api/httpClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function restore() {
      const token = getTokenFromCookie() || getToken()
      if (!token) {
        setLoading(false)
        return
      }
      // Sync localStorage with cookie if cookie exists
      if (getTokenFromCookie() && !getToken()) {
        setToken(token)
      }
      try {
        const user = await authApi.me()
        if (!cancelled) setCurrentUser(user)
      } catch {
        setToken(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  const value = {
    currentUser,
    loading,
    async login(email, password) {
      const result = await authApi.login(email, password)
      if (result.ok) setCurrentUser(result.user)
      return result
    },
    logout() {
      setToken(null)
      setCurrentUser(null)
    },
    async changePassword(currentPassword, newPassword) {
      const user = await authApi.changePassword(currentPassword, newPassword)
      setCurrentUser(user)
      return user
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
