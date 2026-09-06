import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/authApi'
import { getToken, setToken } from '../api/httpClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function restore() {
      if (!getToken()) {
        setLoading(false)
        return
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
