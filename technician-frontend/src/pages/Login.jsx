import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const DEMO_TECH_PHOTO = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&h=320&q=80'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/api/v1/auth/cognito/login?provider=Google&role=technician'
  }

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:8000/api/v1/auth/cognito/login?provider=Facebook&role=technician'
  }

  const handleDemoLogin = async () => {
    setEmail('technician@demo.com')
    setPassword('demo1234') // Standard demo password
    setLoading(true)
    try {
      const result = await login('technician@demo.com', 'demo1234')
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || 'Demo login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred during demo login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (event) => {
    event.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || 'Invalid email or password')
      }
    } catch (err) {
      setError('Connection failed. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative isolate mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2]">
      <div className="pointer-events-none absolute -left-16 top-10 h-96 w-96 rounded-full bg-[#E6A11A]/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-10 bottom-4 h-96 w-96 rounded-full bg-[#14B8A6]/15 blur-[140px]" />
      <div className="relative w-full max-w-4xl space-y-6">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="rounded-full border border-[#1E3A5F]/20 px-4 py-2 text-sm font-semibold text-[#1E3A5F] transition-all hover:border-[#1E3A5F]"
          >
            Back
          </button>
        </div>
        <div className="text-center">
          <span className="mx-auto mb-4 flex w-fit items-center justify-center rounded-3xl bg-[#CFEDEE] p-3 shadow-[0_20px_60px_rgba(30,58,95,0.15)]">
            <img src={DEMO_TECH_PHOTO} alt="Fyxion" className="h-20 w-20 rounded-2xl object-cover" />
          </span>
          <p className="text-xs uppercase tracking-[0.4em] text-[#1E3A5F]/70 font-semibold">Technician Access</p>
        </div>

        <div className="flex gap-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#E6A11A]/20 p-1 shadow-md">
          <button
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-[#E6A11A] to-[#F0B329] text-white shadow-md"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-[#4B5563] hover:text-[#1E3A5F]"
          >
            Create Account
          </button>
        </div>

        <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E6A11A]/20 p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#E6A11A]/5 via-transparent to-[#14B8A6]/5" />
          <div className="relative space-y-6">
            <h1 className="text-3xl font-bold text-center text-[#1E3A5F]">Welcome Back</h1>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSignIn}>
              <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4 text-sm">
                <p className="font-semibold text-[#1E3A5F]">Sign in with email</p>
                <p className="text-xs text-[#4B5563] mt-1">Use your email and password to access your technician dashboard.</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1E3A5F]">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
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
                  placeholder="Enter your password"
                  className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                  style={{ borderColor: '#D1D5DB', color: '#1E3A5F' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full px-6 py-4 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
                style={{ background: '#E6A11A' }}
              >
                {loading ? 'Signing in...' : 'Login with Email'}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs uppercase tracking-[0.3em] text-gray-400">or</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-[#1E3A5F] transition-all hover:border-[#E6A11A]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={handleFacebookLogin}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-[#1E3A5F] transition-all hover:border-[#E6A11A]"
              >
                <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>

              <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#E6A11A]/10 p-4">
                <p className="text-xs font-semibold text-[#1E3A5F] mb-3">Try with Demo Account</p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full rounded-full px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg"
                  style={{ background: '#14B8A6' }}
                >
                  Quick Demo Login
                </button>
                <p className="text-xs text-gray-500 mt-2">Email: technician@demo.com | Status: Pre-approved</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
