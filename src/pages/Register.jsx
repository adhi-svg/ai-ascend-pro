import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ErrorBanner from '../components/ui/ErrorBanner'
import { useApp } from '../context/AppContext'

const Register = () => {
  const navigate = useNavigate()
  const { register, requestLocation } = useApp()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    phone: '',
    email: '',
    address: '',
    location: null,
    otp: '',
    password: '',
    confirmPassword: ''
  })
  const [step, setStep] = useState('details')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  const validateEmail = (email) => {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setForm({ ...form, phone: value })
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setForm({ ...form, otp: value })
  }

  const handleGetCurrentLocation = async () => {
    setError('')
    const loc = await requestLocation()
    if (loc) {
      setForm({ ...form, location: loc, address: `Lat: ${loc.lat.toFixed(4)}, Lng: ${loc.lng.toFixed(4)}` })
    }
  }

  const submitDetails = async (e) => {
    e.preventDefault()
    setError('')
    if (!agreed) {
      setError('Please accept the Terms & Conditions and Privacy Policy to continue')
      return
    } if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Please enter your first and last name')
      return
    }
    if (!form.dob) {
      setError('Please select your date of birth')
      return
    }
    if (!validatePhone(form.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6-9')
      return
    }

    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setStep('otp')
      setLoading(false)
    }, 500)
  }

  const submitOtp = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')

    if (form.otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    if (loading) return

    setLoading(true)

    try {
      // Register with backend - combine first and last name
      const name = `${form.firstName.trim()} ${form.lastName.trim()}`
      await register({
        phone: form.phone,
        email: form.email,
        password: form.password,
        name,
        role: 'customer'
      })

      if (requestLocation) {
        requestLocation().catch(() => { })
      }

      navigate('/customer/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative isolate mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-[#CFEDEE] via-[#E8F8F9] to-[#D4F0F2]">
      <div className="pointer-events-none absolute -left-16 top-10 h-96 w-96 rounded-full bg-[#E6A11A]/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-10 bottom-4 h-96 w-96 rounded-full bg-[#14B8A6]/15 blur-[140px]" />
      <div className="relative w-full max-w-2xl space-y-6">
        <div className="text-center">
          <span className="mx-auto mb-4 flex w-fit items-center justify-center rounded-3xl bg-[#CFEDEE] p-3 shadow-[0_30px_90px_rgba(3,6,20,0.45)]">
            <img src="/logo.png" alt="Field Fix" className="w-32 h-32 object-contain" />
          </span>
        </div>
        <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E6A11A]/20 p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#E6A11A]/5 via-transparent to-[#14B8A6]/5" />
          <div className="relative space-y-6">
            <h1 className="text-3xl font-bold text-center text-[#1E3A5F]">Create your FIXORA account</h1>

            {error && <ErrorBanner message={error} />}

            {step === 'details' ? (
              <form className="space-y-4" onSubmit={submitDetails}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="First name"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="First name"
                  />
                  <Input
                    label="Last name"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
                <Input
                  label="Date of birth"
                  type="date"
                  required
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
                <Input
                  label="Phone number"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handlePhoneChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  helper="Enter Indian mobile starting with 6-9"
                />
                <Input
                  label="Email address"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your.email@example.com"
                  helper="Required for account recovery"
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a password"
                    helper="Minimum 6 characters"
                  />
                  <Input
                    label="Confirm password"
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                  />
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-white/40 text-brand-accent focus:ring-brand-accent"
                  />
                  <label htmlFor="agree" className="text-sm text-brand-text-secondary leading-relaxed cursor-pointer">
                    <span className={`mr-2 font-semibold ${agreed ? 'text-brand-accent' : 'text-white/60'}`}>
                      {agreed ? '<CheckSquare size={16} className="inline mr-1" />' : '<Square size={16} className="inline mr-1" />'} I accept the
                    </span>
                    <Link to="/support/terms" className="text-brand-accent font-semibold hover:text-white">Terms &amp; Conditions</Link>
                    <span className="mx-1">and</span>
                    <Link to="/support/privacy" className="text-brand-accent font-semibold hover:text-white">Privacy Policy</Link>.
                  </label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={submitOtp}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-brand-text-primary">
                  <p className="font-semibold text-brand-text-primary">OTP sent to {form.phone}</p>
                  <p className="text-xs text-brand-text-muted mt-1">Enter the 6-digit code to verify and create your account</p>
                </div>
                <Input
                  label="Enter OTP"
                  type="tel"
                  required
                  value={form.otp}
                  onChange={handleOtpChange}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep('details')} className="flex-1" disabled={loading}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => setError('OTP resent to ' + form.phone)}
                  className="text-sm font-semibold text-brand-accent hover:underline"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </form>
            )}

            <div className="border-t border-white/10 pt-4 text-center">
              <p className="text-sm text-brand-text-muted">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-accent hover:text-white">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
