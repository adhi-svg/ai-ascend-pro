import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminSessionKey } from '../services/adminStore'

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://100.27.210.231:8000'}/api/v1`

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@fyxion.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || data?.error?.details || 'Login failed')
      }

      const user = data?.data?.user
      const token = data?.data?.access_token

      if (!token || !user || user.role !== 'admin') {
        throw new Error('Admin access required')
      }

      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_info', JSON.stringify(user))
      localStorage.setItem(adminSessionKey, '1')
      navigate('/admin/dashboard', { replace: true })
      return
    } catch (err) {
      localStorage.removeItem(adminSessionKey)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      setError(err.message || 'Invalid login credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative isolate mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute -left-16 top-10 h-96 w-96 rounded-full bg-[#E6A11A]/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-10 bottom-4 h-96 w-96 rounded-full bg-[#14B8A6]/15 blur-[140px]" />

      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <span className="mx-auto mb-4 flex w-fit items-center justify-center rounded-3xl bg-[#CFEDEE] p-3 shadow-[0_20px_60px_rgba(30,58,95,0.15)]">
            <img src="/logo.png" alt="Fyxion" className="h-16 w-16 object-contain" />
          </span>
          <h1 className="text-3xl font-bold text-[#1E3A5F]">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to review technician applications</p>
        </div>

        <div className="rounded-2xl bg-white/95 border border-[#E6A11A]/20 p-8 shadow-xl">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@fyxion.com"
                className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                style={{ borderColor: '#D1D5DB', color: '#1E3A5F' }}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                style={{ borderColor: '#D1D5DB', color: '#1E3A5F' }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full px-6 py-4 text-sm font-semibold text-white transition-all hover:shadow-lg"
              style={{ background: '#E6A11A' }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-[#E6A11A]/20 bg-[#CFEDEE]/40 px-4 py-3 text-xs text-[#1E3A5F]">
            Demo credentials: admin@fyxion.com / admin123
          </div>
        </div>
      </div>
    </div>
  )
}
