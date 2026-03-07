import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { techLogin, techRegister, techLogout, getStoredUser, fetchTechProfile, updateTechProfile } from '../services/techApi'

const AuthContext = createContext(null)

const storageKeys = {
  token: 'tech_auth_token',
  user: 'tech_user_info',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token) || '')
  const [loading, setLoading] = useState(false)

  // On mount, try to load profile from backend if we have a token
  useEffect(() => {
    if (!token) return
    fetchTechProfile()
      .then((profile) => {
        if (profile) {
          const merged = { ...user, ...profile }
          setUser(merged)
          localStorage.setItem(storageKeys.user, JSON.stringify(merged))
        }
      })
      .catch(() => {
        // Token invalid — clear auth
        setUser(null)
        setToken('')
        localStorage.removeItem(storageKeys.token)
        localStorage.removeItem(storageKeys.user)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await techLogin(email, password)
      const nextUser = data.user || data
      const nextToken = data.access_token || ''

      setUser(nextUser)
      setToken(nextToken)

      return { success: true, user: nextUser }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    setLoading(true)
    try {
      const data = await techRegister(userData)
      const nextUser = data.user || data
      const nextToken = data.access_token || ''

      setUser(nextUser)
      setToken(nextToken)

      return { success: true, user: nextUser }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    techLogout()
    setUser(null)
    setToken('')
  }

  const updateProfile = async (updates) => {
    try {
      const result = await updateTechProfile(updates)
      const nextUser = { ...user, ...updates, ...result }
      setUser(nextUser)
      localStorage.setItem(storageKeys.user, JSON.stringify(nextUser))
      return { success: true }
    } catch (error) {
      // Fallback: update locally even if API fails
      const nextUser = { ...user, ...updates }
      setUser(nextUser)
      localStorage.setItem(storageKeys.user, JSON.stringify(nextUser))
      return { success: false, error: error.message }
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
