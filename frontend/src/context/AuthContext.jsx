import { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cw_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cw_token')
    if (!token) {
      setLoading(false)
      return
    }

    client
      .get('/me')
      .then((res) => {
        setUser(res.data.user)
        localStorage.setItem('cw_user', JSON.stringify(res.data.user))
      })
      .catch(() => {
        localStorage.removeItem('cw_token')
        localStorage.removeItem('cw_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const res = await client.post('/login', { email, password })
    localStorage.setItem('cw_token', res.data.token)
    localStorage.setItem('cw_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  async function register(payload) {
    const res = await client.post('/register', payload)
    localStorage.setItem('cw_token', res.data.token)
    localStorage.setItem('cw_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  async function logout() {
    try {
      await client.post('/logout')
    } catch {
      // ignore network errors on logout, clear local state regardless
    }
    localStorage.removeItem('cw_token')
    localStorage.removeItem('cw_user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
