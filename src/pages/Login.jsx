import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorBanner from '../components/ui/ErrorBanner'
import DemoCredentials from '../components/DemoCredentials'
import { useApp } from '../context/AppContext'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, requestLocation } = useApp()
  const [showRegister, setShowRegister] = useState(false)
  const [showDemoHelper, setShowDemoHelper] = useState(false)
  const [phone, setPhone] = useState('9000000001')
  const [email, setEmail] = useState('demo@customer.com')
  const [password, setPassword] = useState('demo123')
  const [otp, setOtp] = useState('123456')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState('email')
  const [forgotStep, setForgotStep] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const redirectTo = location.state?.from || '/customer/home'
  const redirectState = location.state?.focus ? { focus: location.state.focus } : undefined

  const validatePhone = (p) => {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(p)
  }

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(val)
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(value)
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://100.27.210.231:8000'

  const handleGoogleLogin = () => {
    // Redirect to backend Cognito route which handles the entire OAuth flow
    window.location.href = `${API_URL}/api/v1/auth/cognito/login?provider=Google&role=customer`
  }

  const handleFacebookLogin = () => {
    window.location.href = `${API_URL}/api/v1/auth/cognito/login?provider=Facebook&role=customer`
  }

  const sendOtp = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')

    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6-9')
      return
    }

    if (loading) return

    setLoading(true)
    setTimeout(() => {
      setStep('otp')
      setLoading(false)
    }, 500)
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    if (loading) return

    setLoading(true)

    try {
      const userData = await login({ phone, password: otp, email })

      if (requestLocation) {
        requestLocation().catch(() => { })
      }

      // Give context time to update before navigating
      setTimeout(() => {
        navigate(redirectTo, { replace: true, state: redirectState })
      }, 100)
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.')
      setLoading(false)
    }
  }

  const sendForgotOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6-9')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setForgotStep('verify-otp')
      setLoading(false)
    }, 500)
  }

  const verifyForgotOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setForgotStep('reset-password')
      setLoading(false)
    }, 500)
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setError('Password reset successful! Please log in with your new password.')
      setForgotStep(null)
      setPhone('')
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setStep('phone')
      setLoading(false)
    }, 500)
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (loading) return

    setLoading(true)

    try {
      // Execute login with backend
      const userData = await login({ email, password })

      // Request location in background
      if (requestLocation) {
        requestLocation().catch(() => { })
      }

      // Give context time to update before navigating
      setTimeout(() => {
        navigate(redirectTo, { replace: true, state: redirectState })
      }, 100)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="relative isolate mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2]">
      <div className="pointer-events-none absolute -left-16 top-10 h-96 w-96 rounded-full bg-[#E6A11A]/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-10 bottom-4 h-96 w-96 rounded-full bg-[#14B8A6]/15 blur-[140px]" />

      {/* Demo Helper Button */}
      <button
        onClick={() => setShowDemoHelper(true)}
        className="fixed top-4 right-4 z-50 bg-gradient-to-r from-[#E6A11A] to-[#F0B329] hover:from-[#C88B12] hover:to-[#E6A11A] text-white font-bold py-3 px-6 rounded-full shadow-2xl transition-all hover:scale-105 animate-pulse flex items-center gap-2"
      >
        <span>🎯</span>
        <span>Demo Credentials</span>
      </button>

      <div className="relative w-full max-w-5xl space-y-6">
        <div className="text-center">
          <span className="mx-auto mb-4 flex w-fit items-center justify-center rounded-3xl bg-[#CFEDEE] p-3 shadow-[0_20px_60px_rgba(30,58,95,0.15)]">
            <img src="/logo.png" alt="Fyxion" className="w-32 h-32 object-contain" />
          </span>
          <p className="text-xs uppercase tracking-[0.4em] text-[#1E3A5F]/70 font-semibold">Customer Access</p>
        </div>

        {/* Toggle between Login and Register */}
        <div className="flex gap-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#E6A11A]/20 p-1 shadow-md">
          <button
            onClick={() => setShowRegister(false)}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${!showRegister
              ? 'bg-gradient-to-r from-[#E6A11A] to-[#F0B329] text-white shadow-md'
              : 'text-[#4B5563] hover:text-[#1E3A5F]'
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${showRegister
              ? 'bg-gradient-to-r from-[#E6A11A] to-[#F0B329] text-white shadow-md'
              : 'text-[#4B5563] hover:text-[#1E3A5F]'
              }`}
          >
            Create Account
          </button>
        </div>

        {showRegister ? (
          // REGISTER FLOW - Redirect to register page
          <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E6A11A]/20 p-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#E6A11A]/5 via-transparent to-[#14B8A6]/5" />
            <div className="relative space-y-6 text-center">
              <h1 className="text-3xl font-bold text-[#1E3A5F]">Create Your Account</h1>
              <p className="text-sm text-[#4B5563]">Join to connect with local technicians in your area</p>
              <Button
                onClick={() => navigate('/register', { state: location.state })}
                className="w-full"
              >
                Continue to Sign Up
              </Button>
              <p className="text-xs text-[#4B5563]">
                Already have an account?
                <button
                  onClick={() => setShowRegister(false)}
                  className="text-[#E6A11A] font-semibold ml-1 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        ) : (
          // LOGIN FLOW
          <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E6A11A]/20 p-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#E6A11A]/5 via-transparent to-[#14B8A6]/5" />
            <div className="relative space-y-6">
              <h1 className="text-3xl font-bold text-center text-[#1E3A5F]">Welcome Back</h1>

              {error && <ErrorBanner message={error} />}

              {forgotStep ? (
                // FORGOT PASSWORD FLOW
                <div>
                  {forgotStep === 'phone' && (
                    <form className="space-y-4" onSubmit={sendForgotOtp}>
                      <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4 text-sm">
                        <p className="font-semibold text-[#1E3A5F]">Reset your password</p>
                        <p className="text-xs text-[#4B5563] mt-1">Enter the mobile number linked with your Aadhar. We'll send an OTP to verify.</p>
                      </div>
                      <Input
                        horizontal
                        label="Mobile number (linked with Aadhar)"
                        type="tel"
                        required
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        inputMode="numeric"
                        helper="Enter Indian mobile starting with 6-9"
                      />
                      <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={() => { setForgotStep(null); setPhone(''); }} className="flex-1" disabled={loading}>
                          Back
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                          {loading ? 'Sending OTP...' : 'Send OTP'}
                        </Button>
                      </div>
                    </form>
                  )}

                  {forgotStep === 'verify-otp' && (
                    <form className="space-y-4" onSubmit={verifyForgotOtp}>
                      <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4 text-sm">
                        <p className="font-semibold text-[#1E3A5F]">Verify OTP</p>
                        <p className="text-xs text-[#4B5563] mt-1">OTP sent to {phone}</p>
                      </div>
                      <Input
                        horizontal
                        label="Enter OTP"
                        type="tel"
                        required
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="6-digit OTP"
                        maxLength={6}
                        inputMode="numeric"
                      />
                      <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={() => { setForgotStep('phone'); setOtp(''); }} className="flex-1" disabled={loading}>
                          Change number
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                          {loading ? 'Verifying...' : 'Verify'}
                        </Button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setError('OTP resent to ' + phone)}
                        className="text-sm font-semibold text-[#E6A11A] hover:text-[#C88B12] hover:underline w-full transition-colors"
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    </form>
                  )}

                  {forgotStep === 'reset-password' && (
                    <form className="space-y-4" onSubmit={resetPassword}>
                      <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4 text-sm">
                        <p className="font-semibold text-[#1E3A5F]">Create new password</p>
                        <p className="text-xs text-[#4B5563] mt-1">Set a strong password for your account</p>
                      </div>
                      <Input
                        horizontal
                        label="New password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create a password"
                        helper="Minimum 6 characters"
                      />
                      <Input
                        horizontal
                        label="Confirm password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                      />
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </Button>
                    </form>
                  )}
                </div>
              ) : step === 'email' ? (
                <form className="space-y-4" onSubmit={handleEmailLogin}>
                  <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4 text-sm">
                    <p className="font-semibold text-[#1E3A5F]">Sign in with Email</p>
                    <p className="text-xs text-[#4B5563] mt-1">Use your email and password to login</p>
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                  />
                  <Input
                    label="Password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    helper="Use the password set during sign up"
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Login with Email'}
                  </Button>
                </form>
              ) : step === 'phone' ? (
                <form className="space-y-4" onSubmit={sendOtp}>
                  <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4 text-sm">
                    <p className="font-semibold text-[#1E3A5F]">Phone verification</p>
                    <p className="text-xs text-[#4B5563] mt-1">We'll send an OTP to verify your number</p>
                  </div>
                  <Input
                    horizontal
                    label="Email (optional)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    helper="Used for updates"
                  />
                  <Input
                    horizontal
                    label="Phone number"
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    inputMode="numeric"
                    helper="Enter Indian mobile starting with 6-9"
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setForgotStep('phone'); setPhone(''); setOtp(''); }}
                    className="text-sm font-semibold text-brand-accent hover:underline w-full"
                  >
                    Forgot Password?
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={verifyOtp}>
                  <div className="rounded-2xl border border-[#E6A11A]/20 bg-[#CFEDEE]/30 p-4 text-sm">
                    <p className="font-semibold text-[#1E3A5F]">OTP sent to {phone}</p>
                    <p className="text-xs text-[#4B5563] mt-1">Enter the 6-digit code to verify your login</p>
                  </div>
                  <Input
                    horizontal
                    label="Enter OTP"
                    type="tel"
                    required
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="6-digit OTP"
                    maxLength={6}
                    inputMode="numeric"
                  />
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => setStep('phone')} className="flex-1" disabled={loading}>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? 'Verifying...' : 'Login'}
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError('OTP resent to ' + phone)}
                    className="text-sm font-semibold text-brand-accent hover:underline"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </form>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#1E3A5F]/10" />
                  <span className="text-xs text-[#4B5563]">OR</span>
                  <div className="h-px flex-1 bg-[#1E3A5F]/10" />
                </div>

                <div className="space-y-2">
                  <Button variant="ghost" className="w-full" onClick={handleGoogleLogin}>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={handleFacebookLogin}>
                    <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Continue with Facebook
                  </Button>
                </div>
              </div>


              <div className="border-t border-[#E6A11A]/10 pt-4 text-center">
                <p className="text-sm text-[#4B5563]">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setShowRegister(true)}
                    className="font-semibold text-[#E6A11A] hover:text-[#C88B12] transition-colors"
                  >
                    Create one here
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Credentials Modal */}
      {showDemoHelper && <DemoCredentials onClose={() => setShowDemoHelper(false)} />}
    </div>
  )
}

export default Login

