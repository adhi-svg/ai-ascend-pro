import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Wrench, IndianRupee, Calendar, TrendingUp, ChevronRight, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const formRef = useRef(null)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handlePhoneChange = (event) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(value)
  }

  const handleSignIn = (event) => {
    event.preventDefault()
    setError('')

    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setTimeout(() => {
      login({
        name: 'Aisha Rahman',
        phone,
      })
      navigate('/dashboard')
    }, 500)
  }

  const benefits = [
    {
      icon: <IndianRupee className="h-8 w-8" style={{ color: '#E6A11A' }} />,
      title: "Keep Your Earnings",
      description: "100% of your work charges go to you. We only take 20% of the booking confirmation fee."
    },
    {
      icon: <Calendar className="h-8 w-8" style={{ color: '#E6A11A' }} />,
      title: "Part-Time Friendly",
      description: "Work whenever you want. Accept jobs based on your availability - morning, evening, or weekends."
    },
    {
      icon: <TrendingUp className="h-8 w-8" style={{ color: '#E6A11A' }} />,
      title: "Reach Thousands of Customers",
      description: "Your profile is visible to thousands of users. Higher ratings = more job requests automatically."
    },
    {
      icon: <Wrench className="h-8 w-8" style={{ color: '#E6A11A' }} />,
      title: "Instant Job Notifications",
      description: "Get booked via auto-assignment (by rating) or when customers choose you manually."
    }
  ]

  const steps = [
    {
      number: "1",
      title: "Sign Up",
      description: "Create your technician profile with your skills and experience"
    },
    {
      number: "2",
      title: "Get Verified",
      description: "Complete verification process to build customer trust"
    },
    {
      number: "3",
      title: "Start Earning",
      description: "Accept jobs, provide quality service, and earn money"
    }
  ]

  const features = [
    "Get auto-assigned to jobs based on your rating",
    "Let customers manually choose your profile",
    "Real-time booking notifications on your phone",
    "Customer pays confirmation fee upfront",
    "80% of booking fee to your wallet, withdraw anytime",
    "Keep 100% of your work and labor charges",
    "Build your reputation with customer ratings",
    "Work part-time without losing visibility"
  ]

  return (
    <div className="relative isolate min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #CFEDEE 0%, #E8F8F9 50%, #D4F0F2 100%)' }}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm" style={{ borderColor: 'rgba(230, 161, 26, 0.2)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-2" style={{ background: '#E6A11A' }}>
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#1E3A5F' }}>Fyxion Partner</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login', { state: { mode: 'register' } })}
              className="rounded-lg px-6 py-2 font-semibold text-white transition-all hover:shadow-lg"
              style={{ background: '#E6A11A' }}
            >
              Become a Partner
            </button>
            <button
              onClick={scrollToForm}
              className="rounded-lg border px-6 py-2 font-semibold transition-all hover:shadow-lg"
              style={{ borderColor: 'rgba(230, 161, 26, 0.6)', color: '#E6A11A', background: 'white' }}
            >
              Already a Partner
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-block rounded-full px-4 py-2 text-sm font-semibold" style={{ background: 'rgba(230, 161, 26, 0.15)', color: '#E6A11A' }}>
              Join over 10,000+ technicians
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl" style={{ color: '#1E3A5F' }}>
              Become a partner in{' '}
              <span style={{ color: '#E6A11A' }}>
                3 easy steps
              </span>
            </h1>
            <p className="text-lg md:text-xl" style={{ color: '#4B5563' }}>
              Get your profile visible to thousands of local customers. Work part-time or full-time - your choice.
              Keep 100% of your labor charges. We only charge 20% on booking confirmations.
            </p>
            <button
              onClick={() => navigate('/login', { state: { mode: 'register' } })}
              className="group flex items-center gap-2 rounded-lg px-8 py-4 text-lg font-semibold text-white transition-all hover:shadow-xl"
              style={{ background: '#E6A11A' }}
            >
              Get Started
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Steps Visual */}
          <div className="overflow-hidden rounded-2xl p-8 shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(230, 161, 26, 0.1) 0%, rgba(207, 237, 238, 0.3) 100%)' }}>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-md">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white" style={{ background: '#E6A11A' }}>
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#1E3A5F' }}>{step.title}</h3>
                    <p className="mt-1 text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technician Access Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8 md:pb-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-block rounded-full px-4 py-2 text-sm font-semibold" style={{ background: 'rgba(230, 161, 26, 0.15)', color: '#E6A11A' }}>
              TECHNICIAN PARTNER NETWORK
            </div>
            <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#1E3A5F' }}>
              Manage your jobs and earnings
              <span style={{ color: '#E6A11A' }}> in one place.</span>
            </h2>
            <p className="text-lg text-gray-600">
              Sign in to view assignments, accept jobs, and track earnings. New to Fyxion? Create your technician profile in minutes.
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(230, 161, 26, 0.15)' }}>
                <p className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>100%</p>
                <p className="mt-1 text-sm text-gray-600">Keep work charges</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(230, 161, 26, 0.15)' }}>
                <p className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>20%</p>
                <p className="mt-1 text-sm text-gray-600">Booking fee only</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(230, 161, 26, 0.15)' }}>
                <p className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>24/7</p>
                <p className="mt-1 text-sm text-gray-600">Profile visible</p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div ref={formRef} className="w-full rounded-2xl border bg-white p-8 shadow-xl" style={{ borderColor: 'rgba(230, 161, 26, 0.3)' }}>
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: '#E6A11A' }}>
                  ⚡
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>Sign in as Fyxion Partner</h2>
                  <p className="mt-1 text-gray-600">Access your technician dashboard and jobs.</p>
                </div>
              </div>

              {error ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSignIn} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#1E3A5F' }}>Phone number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB', color: '#1E3A5F' }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#1E3A5F' }}>Password</label>
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
                  className="w-full rounded-lg px-6 py-4 text-lg font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
                  style={{ background: '#E6A11A' }}
                >
                  {loading ? 'Signing in...' : 'Login with Phone'}
                </button>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs uppercase tracking-[0.3em] text-gray-400">or</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <button
                  type="button"
                  onClick={() => { window.location.href = 'http://98.92.251.154:8000/api/v1/auth/cognito/login?provider=Google&role=technician' }}
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
                  onClick={() => { window.location.href = 'http://98.92.251.154:8000/api/v1/auth/cognito/login?provider=Facebook&role=technician' }}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-[#1E3A5F] transition-all hover:border-[#E6A11A]"
                >
                  <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
                </button>

                <p className="text-center text-sm text-gray-500">
                  Don't have an account?
                  <button
                    type="button"
                    onClick={() => navigate('/login', { state: { mode: 'register' } })}
                    className="ml-1 font-semibold text-[#E6A11A] hover:underline"
                  >
                    Create one here
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#1E3A5F' }}>
              Why partner with Fyxion?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of professionals earning with flexibility and freedom
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg" style={{ borderColor: 'rgba(230, 161, 26, 0.3)' }}
              >
                <div className="mb-4 inline-block rounded-lg p-3 transition-transform group-hover:scale-110" style={{ background: 'rgba(230, 161, 26, 0.15)' }}>
                  {benefit.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold" style={{ color: '#1E3A5F' }}>{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24" style={{ background: 'linear-gradient(135deg, #CFEDEE 0%, #E8F8F9 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#1E3A5F' }}>
                Your earnings, Your schedule, Your control
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                We handle customer connections and booking management. You focus on delivering quality service and keeping your profits.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 shrink-0 text-orange-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="rounded-xl p-6" style={{ background: 'rgba(230, 161, 26, 0.15)' }}>
                  <div className="text-4xl font-bold" style={{ color: '#1E3A5F' }}>₹50,000+</div>
                  <div className="mt-2 text-gray-600">Average monthly from jobs</div>
                </div>
                <div className="rounded-xl p-6" style={{ background: 'rgba(230, 161, 26, 0.15)' }}>
                  <div className="text-4xl font-bold" style={{ color: '#1E3A5F' }}>20%</div>
                  <div className="mt-2 text-gray-600">Platform fee (booking only)</div>
                </div>
                <div className="rounded-xl p-6" style={{ background: 'rgba(230, 161, 26, 0.15)' }}>
                  <div className="text-4xl font-bold" style={{ color: '#1E3A5F' }}>100%</div>
                  <div className="mt-2 text-gray-600">You keep work charges</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#1E3A5F' }}>
              How does it work?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple process to start earning with Fyxion
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="rounded-xl border-2 bg-white p-8 text-center" style={{ borderColor: 'rgba(230, 161, 26, 0.3)' }}>
                <div className="mb-4 inline-block rounded-full px-6 py-3 text-2xl font-bold text-white" style={{ background: '#E6A11A' }}>
                  Step 1
                </div>
                <h3 className="mb-3 text-xl font-bold" style={{ color: '#1E3A5F' }}>Register & Get Verified</h3>
                <p className="text-gray-600">
                  Create your profile with skills and areas. Complete verification to build customer trust.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl border-2 border-teal-200 bg-gradient-to-br from-white to-cyan-50 p-8 text-center">
                <div className="mb-4 inline-block rounded-full bg-gradient-to-br from-teal-600 to-amber-500 px-6 py-3 text-2xl font-bold text-white">
                  Step 2
                </div>
                <h3 className="mb-3 text-xl font-bold" style={{ color: '#1E3A5F' }}>Get Bookings</h3>
                <p className="text-gray-600">
                  Customers find you via auto-assign (rating-based) or manual selection. Accept jobs you want.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl border-2 border-teal-200 bg-gradient-to-br from-white to-cyan-50 p-8 text-center">
                <div className="mb-4 inline-block rounded-full bg-gradient-to-br from-teal-600 to-amber-500 px-6 py-3 text-2xl font-bold text-white">
                  Step 3
                </div>
                <h3 className="mb-3 text-xl font-bold" style={{ color: '#1E3A5F' }}>Work & Earn</h3>
                <p className="text-gray-600">
                  Customer pays confirmation upfront. Complete work, charge your rates. 80% booking fee to wallet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-16 md:py-24" style={{ background: 'linear-gradient(135deg, #CFEDEE 0%, #E8F8F9 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#1E3A5F' }}>
              Success Stories from Our Partners
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Real technicians, real earnings, real growth
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex items-center gap-4">
                <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: 'rgba(230, 161, 26, 0.2)', color: '#E6A11A' }}>
                  RS
                </div>
                <div>
                  <h4 className="font-bold" style={{ color: '#1E3A5F' }}>Rajesh Sharma</h4>
                  <p className="text-sm text-gray-600">Plumber, Delhi</p>
                </div>
              </div>
              <div className="mb-4" style={{ color: '#E6A11A' }}>★★★★★</div>
              <p className="text-gray-700">
                "Best part? I keep all my labor charges! Platform only takes 20% of booking fee. I work part-time but my profile is visible 24/7. More customers find me now!"
              </p>
              <div className="mt-4 rounded-lg p-4" style={{ background: 'rgba(230, 161, 26, 0.1)' }}>
                <p className="text-sm font-semibold" style={{ color: '#E6A11A' }}>Monthly from Jobs</p>
                <p className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>₹65,000</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex items-center gap-4">
                <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: 'rgba(230, 161, 26, 0.2)', color: '#E6A11A' }}>
                  AM
                </div>
                <div>
                  <h4 className="font-bold" style={{ color: '#1E3A5F' }}>Amit Mehta</h4>
                  <p className="text-sm text-gray-600">Electrician, Mumbai</p>
                </div>
              </div>
              <div className="mb-4" style={{ color: '#E6A11A' }}>★★★★★</div>
              <p className="text-gray-700">
                "I get auto-assigned to high-paying jobs because of my 4.9 rating. Customers also choose me manually. My wallet gets 80% booking fee immediately!"
              </p>
              <div className="mt-4 rounded-lg p-4" style={{ background: 'rgba(230, 161, 26, 0.1)' }}>
                <p className="text-sm font-semibold" style={{ color: '#E6A11A' }}>Monthly from Jobs</p>
                <p className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>₹72,000</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex items-center gap-4">
                <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: 'rgba(230, 161, 26, 0.2)', color: '#E6A11A' }}>
                  PK
                </div>
                <div>
                  <h4 className="font-bold" style={{ color: '#1E3A5F' }}>Priya Kumar</h4>
                  <p className="text-sm text-gray-600">AC Technician, Bangalore</p>
                </div>
              </div>
              <div className="mb-4" style={{ color: '#E6A11A' }}>★★★★★</div>
              <p className="text-gray-700">
                "Working part-time but earning full-time! My profile reaches thousands. Platform doesn't touch my work charges - only small fee on bookings. Worth it!"
              </p>
              <div className="mt-4 rounded-lg p-4" style={{ background: 'rgba(230, 161, 26, 0.1)' }}>
                <p className="text-sm font-semibold" style={{ color: '#E6A11A' }}>Monthly from Jobs</p>
                <p className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>₹58,000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#1E3A5F' }}>
              Services You Can Offer
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Multiple categories to match your expertise
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Plumbing', icon: '🔧', demand: 'High Demand' },
              { name: 'Electrical', icon: '⚡', demand: 'Very High' },
              { name: 'AC Repair', icon: '❄️', demand: 'High Demand' },
              { name: 'Carpentry', icon: '🪚', demand: 'Medium' },
              { name: 'Painting', icon: '🎨', demand: 'High Demand' },
              { name: 'Appliance Repair', icon: '🔌', demand: 'Very High' },
              { name: 'Pest Control', icon: '🐛', demand: 'Medium' },
              { name: 'Cleaning', icon: '🧹', demand: 'High Demand' }
            ].map((service, index) => (
              <div key={index} className="rounded-xl border bg-white p-6 text-center transition-all hover:shadow-lg" style={{ borderColor: 'rgba(230, 161, 26, 0.3)' }}>
                <div className="mb-3 text-4xl">{service.icon}</div>
                <h3 className="mb-2 text-lg font-bold" style={{ color: '#1E3A5F' }}>{service.name}</h3>
                <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(230, 161, 26, 0.15)', color: '#E6A11A' }}>
                  {service.demand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24" style={{ background: 'linear-gradient(135deg, #CFEDEE 0%, #E8F8F9 100%)' }}>
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#1E3A5F' }}>
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about partnering with Fyxion
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How much does the platform charge?',
                a: 'Only 20% of the booking confirmation fee. You keep 100% of your work charges, labor costs, and material fees. All direct payments between you and customer are yours.'
              },
              {
                q: 'How do customers find me?',
                a: 'Two ways: (1) Auto-assignment based on your rating and availability, or (2) Manual selection when customers browse technician profiles. Higher ratings = more auto-assignments!'
              },
              {
                q: 'When do I get paid?',
                a: 'Customer pays confirmation fee upfront. After booking confirmation, 80% goes to your wallet immediately. You can withdraw anytime. Work charges are settled directly with customer.'
              },
              {
                q: 'Can I work part-time?',
                a: 'Yes! Your profile stays visible 24/7 even if you only work few hours. Accept jobs only when available. Many partners work part-time and still get regular bookings.'
              },
              {
                q: 'What if I want to refuse a job?',
                a: 'You can accept or reject any booking request. No penalties. However, higher acceptance rates improve your rating and increase auto-assignment chances.'
              },
              {
                q: 'Is there a monthly subscription fee?',
                a: 'Minimal monthly fee for platform access. But you only pay when you earn. If you get 10+ bookings monthly, the platform pays for itself through increased customer reach.'
              }
            ].map((faq, index) => (
              <details key={index} className="group rounded-xl bg-white p-6 shadow-md">
                <summary className="flex cursor-pointer items-center justify-between font-semibold" style={{ color: '#1E3A5F' }}>
                  {faq.q}
                  <span className="transition-transform group-open:rotate-180" style={{ color: '#E6A11A' }}>▼</span>
                </summary>
                <p className="mt-4 text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* App Features Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="rounded-2xl p-8 shadow-2xl" style={{ background: '#E6A11A' }}>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white">Fyxion Partner App Features</h3>
                  <ul className="space-y-4 text-white">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 shrink-0" />
                      <span>Get notified instantly when customers book you</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 shrink-0" />
                      <span>Auto-assigned jobs based on your rating</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 shrink-0" />
                      <span>Customer pays confirmation fee upfront</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 shrink-0" />
                      <span>80% booking fee to wallet, withdraw anytime</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 shrink-0" />
                      <span>Track your jobs, ratings, and monthly income</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 shrink-0" />
                      <span>GPS navigation and live location sharing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold md:text-4xl" style={{ color: '#1E3A5F' }}>
                Get discovered by thousands of customers
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Your profile works for you 24/7. Work part-time, full-time, or weekends only. High ratings get you auto-assigned to premium jobs. Your earnings stay protected - we never touch your work charges.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl p-6" style={{ background: 'rgba(230, 161, 26, 0.15)' }}>
                  <div className="mb-2 text-3xl font-bold" style={{ color: '#1E3A5F' }}>4.8★</div>
                  <div className="text-gray-600">App Store Rating</div>
                </div>
                <div className="rounded-xl p-6" style={{ background: 'rgba(230, 161, 26, 0.15)' }}>
                  <div className="mb-2 text-3xl font-bold" style={{ color: '#1E3A5F' }}>100K+</div>
                  <div className="text-gray-600">App Downloads</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ background: '#E6A11A' }}>
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to reach thousands of customers?
          </h2>
          <p className="mt-4 text-lg text-white opacity-90">
            Keep 100% of work charges. Only 20% on booking fee. Work part-time. Earn full-time.
          </p>
          <button
            onClick={() => navigate('/login', { state: { mode: 'register' } })}
            className="mt-8 rounded-lg px-8 py-4 text-lg font-semibold transition-all hover:shadow-xl" style={{ background: 'white', color: '#1E3A5F' }}
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-gray-600 md:px-8">
          <p>&copy; 2026 Fyxion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
