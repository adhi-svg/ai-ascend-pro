import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const storageKeys = {
  token: 'tech_auth_token',
  user: 'tech_user_info',
}

const defaultTechnician = {
  id: 'tech-001',
  name: 'Aisha Rahman',
  role: 'technician',
  phone: '555-201-3344',
  skills: ['HVAC', 'Electrical', 'Plumbing'],
  serviceArea: 'North District',
  experience: '5 years',
  rating: 4.8,
}

const loadUser = () => {
  try {
    const storedUser = localStorage.getItem(storageKeys.user)
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token) || '')

  const login = (overrides = {}) => {
    const nextUser = {
      id: overrides.applicationId || `tech-${Date.now()}`,
      name: overrides.name || 'Technician',
      role: 'technician',
      phone: overrides.phone || '',
      skills: overrides.skills || ['General'],
      serviceArea: overrides.serviceArea || 'Local',
      experience: overrides.experience || '0 years',
      rating: overrides.rating || 0,
      ...overrides,
    }
    const nextToken = 'tech_mock_token_12345'

    setUser(nextUser)
    setToken(nextToken)

    localStorage.setItem(storageKeys.token, nextToken)
    localStorage.setItem(storageKeys.user, JSON.stringify(nextUser))
  }

  const logout = () => {
    setUser(null)
    setToken('')
    localStorage.removeItem(storageKeys.token)
    localStorage.removeItem(storageKeys.user)
  }

  const updateProfile = (updates) => {
    setUser((prev) => {
      if (!prev) return prev
      const nextUser = { ...prev, ...updates }
      localStorage.setItem(storageKeys.user, JSON.stringify(nextUser))
      return nextUser
    })
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
      updateProfile,
    }),
    [user, token],
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
